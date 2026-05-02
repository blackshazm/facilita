# Arquitetura: Modular Hexagonal Evolutivo

Este documento detalha o padrão arquitetural "Modular Hexagonal Evolutivo" escolhido para o backend do projeto FACILITA.

## 1. O Modelo

Não é monolito de camadas tradicional. Não é microserviço. É um único deploy dividido em Bounded Contexts autônomos, cada um com arquitetura hexagonal interna, que se comunicam por eventos de domínio e interfaces de aplicação.

```text
┌─────────────────────────────────────────────────────────────┐
│                    MONOLITH DEPLOYMENT                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Identity │ │ Catalog │ │Matching │ │ Orders  │           │
│  │(Hexagon)│ │(Hexagon)│ │(Hexagon)│ │(Hexagon)│           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Payments │ │Evidence │ │ Fraud   │ │Disputes │           │
│  │(Hexagon)│ │(Hexagon)│ │(Hexagon)│ │(Hexagon)│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  Event Bus (Internal) │ Anti-Corruption Layers              │
└─────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
PostgreSQL  Redis  S3  Stripe  Twilio
(schemas    (geo + (fotos) (split) (SMS)
separados)  filas)
```

## 2. Por Que Esta E Não Outra

| Arquitetura | Por que não serve para FACILITA |
|---|---|
| Microserviços | 2 devs não operam 8 serviços. Transação distribuída (pedido + pagamento + comissão) vira saga complexa. Debug de "chuveiro não liberou pagamento" às 22h vira pesadelo. |
| Monolito em Camadas (Controller → Service → Repository) | Em 6 meses vira spaghetti. Quando for extrair Payments, descobre que 40 tabelas fazem JOIN cruzado. Reescrever tudo. |
| Serverless puro (Lambda) | Cold start mata urgência. Prestador clica "Aceitar" e espera 3 segundos? Perdeu o job. Estado em memória (matching em tempo real) é impossível. |
| Modular sem Hexagonal | Módulos conversam via banco compartilhado. Um ALTER TABLE no Orders quebra o Fraud. |
| Event Sourcing total | Overkill. Só a timeline do pedido precisa de audit trail completo. Evidência fotográfica não. |

A escolha certa precisa resolver 3 tensões do seu domínio:
1. **Consistência financeira**: Pedido criado → Pagamento autorizado → Split calculado → Repasse agendado. Isso precisa ser atômico ou compensado. Em monolito, é uma transaction de banco. Em microserviços, é orquestração de saga.
2. **Latência de matching**: Prestador precisa receber job em <3 segundos. Chamada interna de método (monolito) vs. HTTP + serialização (microserviço).
3. **Isolamento de domínio**: Quando fraud crescer para usar Python/ML, você extrai só aquele módulo. O resto continua intacto.

## 3. Estrutura Detalhada dos Bounded Contexts

Cada contexto é um hexágono independente:

```text
src/
├── modules/
│   ├── identity/
│   │   ├── domain/          (entities, value objects, domain events)
│   │   ├── application/     (use cases, ports/interfaces)
│   │   ├── infrastructure/  (prisma repo, bcrypt, jwt)
│   │   └── interface/       (controllers, DTOs, presenters)
│   ├── matching/
│   ├── orders/
│   ├── payments/
│   ├── evidence/
│   ├── fraud/
│   └── notifications/
├── shared-kernel/           (tipos, exceptions, event-bus abstraction)
└── main.ts                  (composição root)
```

**Regras de ouro (impostas pelo linter/CI):**
- Domain não importa nada externo. Puro TypeScript. Se amanhã trocar NestJS por Fastify, o domain não mexe.
- Módulo A não acessa infraestrutura do Módulo B. Orders não faz `prisma.payout.create()`. Orders chama `IPaymentService.createHold()`.
- Comunicação cross-module só via: (a) Interface de aplicação (síncrono, mesma transação) ou (b) Evento de domínio (assíncrono, desacoplado).

## 4. Como Os Módulos Conversam (Exemplos Reais)

**Exemplo 1: Cliente cria pedido de chuveiro (Fluxo síncrono + transacional)**

```typescript
// Orders Module (Application Service)
@Injectable()
class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentService: IPaymentService,      // Interface! Implementação em Payments
    private matchingService: IMatchingService,    // Interface!
    private eventBus: IEventBus,
  ) {}

  async execute(dto: CreateOrderDto) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Domínio puro
      const order = Order.create(dto);
      await this.orderRepo.save(order, tx);
      
      // 2. Pré-autorização síncrona (mesma transação)
      await this.paymentService.authorize(order.id, order.total, tx);
      
      // 3. Dispara match assíncrono (não bloqueia resposta HTTP)
      await this.eventBus.publish(new OrderCreatedEvent(order));
      
      return order;
    });
  }
}
```

*Por que síncrono para pagamento?* Se o cartão não passa, o pedido não existe. Rollback automático.
*Por que assíncrono para matching?* O cliente não precisa esperar o algoritmo rodar. Recebe "Pedido recebido, buscando profissional..." e push notification quando achar.

**Exemplo 2: Prestador conclui serviço (Fluxo event-driven)**

```text
[Prestador clica "Concluir"]
         │
         ▼
┌─────────────────┐
│  Orders Module  │ ──► publica OrderCompletedEvent
└─────────────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
┌──────┐┌──────┐┌──────────┐
│Payments││Evidence││Fraud     │
│(libera ││(valida ││(scoring  │
│repasse)││ fotos) ││ comport.)│
└──────┘└──────┘└──────────┘
    │         │         │
    └────┬────┘         │
         ▼              ▼
   [Repasse D+7]  [Score atualizado]
```

Vantagem: Evidence pode falhar (foto sem geolocalização) sem quebrar Payments. Fraud pode demorar 2 segundos para analisar padrões sem travar a conclusão do pedido.

## 5. Database: Um Servidor, Schemas Isolados

Não é microserviço (um banco por serviço), mas também não é monolito tradicional (tudo misturado).

```sql
-- PostgreSQL: database 'facilita'
CREATE SCHEMA identity;
CREATE SCHEMA catalog;
CREATE SCHEMA orders;
CREATE SCHEMA payments;
CREATE SCHEMA evidence;
CREATE SCHEMA fraud;
```

| Schema | Dono | Acesso externo |
|---|---|---|
| orders.order | Orders Module | Só via IOrderRepository |
| payments.payout | Payments Module | Só via IPayoutRepository |
| fraud.signal | Fraud Module | Só via IFraudRepository |

Quando extrair para banco separado: Quando o módulo virar microserviço (mês 12-18). Até lá, backup é único, joins são possíveis para relatórios (read replica), mas runtime é isolado.

## 6. Estratégia De Evolução: "Strangler Fig"

Você não vai reescrever. Vai estrangular o monolito gradualmente.

**Fase 1: Monolito Puro (Mês 0-12)**
- Tudo em um processo Node.js
- Event Bus = implementação em memória ou Redis pub/sub simples
- Deploy único na AWS ECS Fargate

**Fase 2: Extrair Matching (Mês 12-15)**
- **Sinal:** Matching consome 70% da CPU durante horário de pico (19h-21h).
- **Como:** 
  - Cria novo serviço `matching-service` (Node.js + Redis Geo)
  - Monolito continua publicando `OrderCreatedEvent`
  - Novo serviço consome do Kafka/Redis Streams
  - Monolito mantém Anti-Corruption Layer: `MatchingHttpAdapter` implementa `IMatchingService`
  - Troca a injeção de dependência no NestJS:
  
```typescript
// Antes
{ provide: IMatchingService, useClass: InternalMatchingService }
// Depois
{ provide: IMatchingService, useClass: MatchingHttpAdapter }
```

**Fase 3: Extrair Fraud (Mês 15-20)**
- **Sinal:** Precisa de Python + TensorFlow para análise de padrões de fraude.
- **Como:** Mesmo padrão. O evento `OrderCompletedEvent` passa a ser consumido por serviço externo. Monolito nem percebe.

**Fase 4: Extrair Payments (Mês 20-30)**
- **Sinal:** Compliance financeiro exige PCI DSS nível superior, ou conciliação bancária complexa.
- **Como:** Extrai Payments com seu próprio banco. Orders chama `IPaymentService` que agora é HTTP client.

```text
┌─────────────┐     HTTP      ┌─────────────┐
│  Monolito   │◄─────────────►│   Payments  │
│  (Orders +  │   (ACL)       │   Service   │
│   Disputes +│               │  (próprio   │
│   Catalog)  │    Events     │   banco)    │
└─────────────┘◄──────────────┘
```

## 7. Stack Concreta Recomendada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | NestJS 10+ | Módulos nativos, DI robusto, suporte a eventos |
| Linguagem | TypeScript strict | Domain em TS puro, sem dependência de framework |
| Banco | PostgreSQL 15 + PostGIS | ACID para financeiro, geospatial para matching |
| Cache/Fila | Redis (BullMQ) | Filas, geo queries, sessões, rate limiting |
| Event Bus | Redis Pub/Sub → Kafka (mês 12+) | Começa simples, evolui para streaming |
| ORM | Prisma | Migrations por schema, type-safe |
| App Prestador | React Native / Expo | Câmera nativa, push confiável, GPS background |
| App Cliente | Next.js 15 (PWA) | SEO para landing, agendamento não-crítico |
| Infra | AWS ECS Fargate | Containers, auto-scaling, sem gerenciar servidor |
| Observability | Datadog ou New Relic | Trace distribuído (mesmo no monolito, entre módulos) |

## 8. Armadilhas Que Você Deve Evitar

| Armadilha | Por que mata | Como evitar |
|---|---|---|
| "Vamos usar GraphQL entre módulos internos" | Acoplamento de schema. Mudança no Catalog quebra Orders. | REST interno simples ou apenas eventos. GraphQL só para cliente externo. |
| "Prisma Client global com todas as tabelas" | Qualquer módulo faz query em qualquer tabela. | Prisma schemas separados por módulo. |
| "Evento síncrono para tudo" | Pedido cria 8 eventos, cliente espera 3 segundos na tela. | Síncrono só para transações financeiras. Assíncrono para resto. |
| "Vamos começar com Kafka" | Overhead operacional para 200 pedidos/mês. | Redis pub/sub ou BullMQ. Kafka só após 10K eventos/dia. |
| "Domain importa NestJS decorator" | Perde independência do hexágono. | Domain é pasta pura. Decorators ficam em interface/. |

## 9. Veredicto Executivo

Use Monolito Modular Hexagonal com Event-Driven interno. Ele é:
- **Rápido hoje**: 2 devs entregam features sem debugar rede
- **Correto amanhã**: Cada módulo pode virar microserviço sem reescrever domain
- **Seguro financeiramente**: Transações ACID para pagamento, eventos assíncronos para operações
- **Escala por extração**: Strangler Fig pattern quando o negócio justificar
