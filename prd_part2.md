---

## 5. MODELO DE NEGÓCIO

### 5.1 Estrutura de Receita

**Receita Primária: Comissão por Transação (via Pagar.me)**

| Tier do Prestador | Comissão | Exemplo (Job de R$ 150) |
|---|---|---|
| Tier 1 | 25% | Plataforma: R$ 37,50 |
| Tier 2 | 20% | Plataforma: R$ 30,00 |
| Tier 3 | 18% | Plataforma: R$ 27,00 |

**Premissa:** 60% dos prestadores no Tier 2 (após mês 6)
**Comissão média efetiva:** 20,5%

**Receitas Secundárias**

| Fonte | Cobrança | Volume Esperado (Mês 12) | Receita Mensal |
|---|---|---|---|
| Taxa de urgência | R$ 25 | 30% dos pedidos (600) | R$ 15.000 |
| Taxa de cancelamento cliente | R$ 20 | 5% dos pedidos (100) | R$ 2.000 |
| Antecipação de recebíveis | 2,5%/mês (Pagar.me) | 20% dos prestadores (R$ 150k) | R$ 3.750 |
| Seguro estendido (futuro) | R$ 9,90 | 10% adesão (200) | R$ 1.980 |

**Total Receitas Secundárias (Mês 12):** R$ 22.730 (~27% da receita total)

### 5.2 Estrutura de Custos

**Custos Variáveis (por pedido)**

| Item | Valor | Ferramenta/Fornecedor |
|---|---|---|
| Gateway de pagamento | 2,5% + R$ 0,35 | Pagar.me (marketplace) |
| Infraestrutura (AWS/Render) | R$ 2,00 | Render.com (MVP) → AWS (escala) |
| SMS (OTP + notificações) | R$ 0,30 | Twilio |
| KYC prestador (amortizado) | R$ 1,50 | Truora (R$ 15 / 10 jobs) |
| Storage (fotos S3) | R$ 0,20 | AWS S3 com política de retenção 18 meses |
| **Total Variável** | **~R$ 9,50** | **(6,3% do ticket médio)** |

**Custos Fixos Mensais — MVP (200 pedidos/mês):**
Salários revisados com base no mercado SP 2024/2025.

| Item | Valor |
|---|---|
| 2 devs full-stack senior (R$ 16-18K cada) | R$ 34.000 |
| 1 product manager (pode ser fundador) | R$ 12.000 |
| 2 ops/suporte (R$ 5K cada) | R$ 10.000 |
| Infraestrutura fixa (Render + Supabase + Upstash + Vercel) | R$ 1.400 |
| Ferramentas (analytics, monitoring, Stream.io, CRM) | R$ 3.500 |
| Jurídico/Contábil | R$ 3.000 |
| Espaço físico/Coworking SP zona sul | R$ 3.500 |
| **Total Fixo MVP** | **R$ 67.400** |

**Custos Fixos Mensais — Escala (2.000 pedidos/mês, Mês 12):**

| Item | Valor |
|---|---|
| Salários (12 pessoas: 4 dev, 2 produto, 5 ops, 1 antifraude) | R$ 105.000 |
| Infraestrutura (migração AWS) | R$ 5.500 |
| Ferramentas | R$ 4.500 |
| Jurídico/Contábil | R$ 5.000 |
| Espaço físico (escritório) | R$ 8.000 |
| **Total Fixo Escala** | **R$ 128.000** |

**Custo de Aquisição de Cliente:**

| Canal | CAC | Conversão | Volume Esperado (Mês 6) |
|---|---|---|---|
| Google Ads (Search) | R$ 60 | 6% (conservador) | 240 clientes (40%) |
| Indicação | R$ 40 | 50% | 180 clientes (30%) |
| Parcerias (síndicos/imobiliárias) | R$ 30 | 25% | 120 clientes (20%) |
| Orgânico (SEO) | R$ 10 | 5% | 60 clientes (10%) |
| **Média Ponderada** | **R$ 48** | | **600 clientes/mês** |

**Custo de Aquisição de Prestador:**

| Atividade | Custo | Meta |
|---|---|---|
| Recrutamento ativo (lojas, SENAI) | R$ 150/prestador | 50 prestadores (mês 12) |
| Ads para prestador | R$ 80/prestador | 20 prestadores |
| Background check + KYC | R$ 45/prestador | 70 total |
| Treinamento/onboarding | R$ 50/prestador | 70 total |
| **CAC Médio Prestador** | **R$ 220** | |

### 5.3 Projeção Financeira Revisada (12 Meses)

> Projeção com salários de mercado SP, custo de React Native e buffer conservador de 30%.

| Mês | Pedidos | Rec. Comissão | Rec. Sec. | Rec. Total | Custos Var. | CAC | Custos Fixos | Resultado | Burn Acum. |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 20 | R$ 615 | R$ 100 | R$ 715 | R$ 190 | R$ 2.400 | R$ 67.400 | -R$ 69.275 | -R$ 69.275 |
| 2 | 60 | R$ 1.845 | R$ 360 | R$ 2.205 | R$ 570 | R$ 6.000 | R$ 67.400 | -R$ 71.765 | -R$ 141.040 |
| 3 | 160 | R$ 4.920 | R$ 1.200 | R$ 6.120 | R$ 1.520 | R$ 9.600 | R$ 70.000 | -R$ 75.000 | -R$ 216.040 |
| 4 | 280 | R$ 8.610 | R$ 2.520 | R$ 11.130 | R$ 2.660 | R$ 13.200 | R$ 73.000 | -R$ 77.730 | -R$ 293.770 |
| 5 | 420 | R$ 12.915 | R$ 4.410 | R$ 17.325 | R$ 3.990 | R$ 16.800 | R$ 78.000 | -R$ 81.465 | -R$ 375.235 |
| 6 | 600 | R$ 18.450 | R$ 7.200 | R$ 25.650 | R$ 5.700 | R$ 21.600 | R$ 83.000 | -R$ 84.650 | -R$ 459.885 |
| 7 | 800 | R$ 24.600 | R$ 10.400 | R$ 35.000 | R$ 7.600 | R$ 24.000 | R$ 90.000 | -R$ 86.600 | -R$ 546.485 |
| 8 | 1.000 | R$ 30.750 | R$ 13.750 | R$ 44.500 | R$ 9.500 | R$ 28.000 | R$ 98.000 | -R$ 91.000 | -R$ 637.485 |
| 9 | 1.200 | R$ 36.900 | R$ 17.280 | R$ 54.180 | R$ 11.400 | R$ 30.000 | R$ 105.000 | -R$ 92.220 | -R$ 729.705 |
| 10 | 1.500 | R$ 46.125 | R$ 22.500 | R$ 68.625 | R$ 14.250 | R$ 36.000 | R$ 110.000 | -R$ 91.625 | -R$ 821.330 |
| 11 | 1.800 | R$ 55.350 | R$ 27.720 | R$ 83.070 | R$ 17.100 | R$ 42.000 | R$ 118.000 | -R$ 94.030 | -R$ 915.360 |
| 12 | 2.000 | R$ 61.500 | R$ 31.500 | R$ 93.000 | R$ 19.000 | R$ 45.000 | R$ 128.000 | -R$ 99.000 | -R$ 1.014.360 |

**Burn Total Ano 1:** R$ 1.014.360
**Capital necessário (com buffer de 50%):** **R$ 1.500.000**

> O buffer aqui é 50% (não 30%) porque: (a) Google Ads pode ter conversão abaixo de 6%, (b) no-show de prestador cria créditos ao cliente que aumentam o burn, (c) disputas/chargebacks não provisionados na tabela acima. R$ 1,5M é o mínimo real para 12 meses com operação profissional.

**Break-even projetado:** Mês 24-26 (4.200-4.500 pedidos/mês)

**Riscos da projeção:**
- ❌ CAC Google Ads pode chegar a R$ 80-100 se taxa de conversão ficar em 3-4% (média de mercado)
- ❌ Não provisiona reserva para disputas/chargebacks (~3% da receita)
- ❌ Prestador no-show gera créditos ao cliente que não estão no burn
- ✅ Salários estão no nível de mercado SP (diferente da versão anterior do PRD)

### 5.4 Unit Economics (Mês 12 — Estabilizado)

**Por Pedido:**
```
Ticket médio: R$ 150

RECEITAS
├─ Comissão (20%):          R$ 30,00
├─ Taxa urgência (30%):     R$  7,50
└─ Total receita/pedido:    R$ 37,50

CUSTOS VARIÁVEIS
├─ Gateway Pagar.me:        R$  4,10 (2,7% de R$ 150)
├─ Infra/Storage:           R$  2,20
├─ SMS:                     R$  0,30
├─ KYC amortizado:          R$  1,50
└─ Total variável/pedido:   R$  8,10

MARGEM BRUTA/PEDIDO:        R$ 29,40 (78,4%)
CAC amortizado (LTV 5 jobs): R$  9,60
CONTRIBUIÇÃO LÍQUIDA:       R$ 19,80 por pedido
```

**LTV/CAC (Mês 12):**
```
LTV (4,5 jobs × R$ 29,40): R$ 132,30 margem bruta
CAC: R$ 48
LTV/CAC: 2,75x
```

---

## 6. GO-TO-MARKET

### 6.1 Estratégia de Oferta (Recrutamento de Prestadores)

**Requisito obrigatório de onboarding:** MEI ativo (CNPJ). Prestadores sem MEI recebem orientação de abertura no próprio app — o processo é gratuito e leva 15 minutos no gov.br. Isso garante: emissão de NF (requisito para B2B futuro), split de pagamento limpo no Pagar.me, e conformidade trabalhista.

**Fase 0: Antes do Beta (Semanas 1-10)**

**Canal 1: Abordagem em lojas de material de construção**

Playbook:
1. Identificar os 10 melhores profissionais em lojas parceiras (Leroy Merlin, C&C, lojas de bairro)
2. Critério de seleção: ferramentas próprias, uniforme, responde rápido
3. Observar quem os clientes pedem indicação
4. Abordagem: "Plataforma séria, sem lead ruim, pagamento garantido, zero comissão nos primeiros 30 dias"
5. Cadastro no app ali mesmo
6. Meta: 1-2 prestadores/loja (10-20 total)

**Canal 2: Parceria com SENAI / Escolas Técnicas**

1. Contato com coordenação de elétrica/hidráulica
2. Oferta: "Vamos dar trabalho para os melhores formandos"
3. Selecionar top 10% da turma
4. Meta: 5 prestadores jovens (mais abertos a nova plataforma)

**Canal 3: Headhunting via GetNinjas/Triider**

1. Usar GetNinjas como cliente para avaliar prestadores
2. Selecionar quem responde rápido, de forma profissional
3. Contato direto: "Tenho uma proposta — menos comissão, lead qualificado, pagamento garantido"
4. Meta: 3-5 prestadores experientes

**Proposta de Valor para Primeiros Prestadores:**

| Benefício | Detalhamento |
|---|---|
| Zero comissão (30 dias) | Mês 1: 0% |
| Garantia de demanda | Mínimo 8 jobs/mês ou compensação de R$ 200 |
| Suporte prioritário | WhatsApp direto do fundador (Fase 0) |
| Kit profissional | Camisa + boné + terminais de ferramenta (custo: R$ 80) |
| Sem exclusividade | Pode continuar em outras plataformas |
| Orientação MEI | Abertura gratuita orientada pela equipe (se necessário) |

**Job-Shadowing para Primeiros Jobs (Semanas 11-14):**
Nas primeiras 4 semanas de beta, um membro da equipe de operações (ou o próprio fundador) acompanha presencialmente os primeiros 10-15 jobs. Isso serve para: calibrar tempo médio de execução, identificar falhas no fluxo do app, garantir qualidade das evidências e treinar os prestadores na prática. **Atenção:** Não há prestadores Tier 3 no início — o shadowing é feito pela operação, não por outros prestadores.

**Investimento Fase 0:**
- 20 prestadores × R$ 200 (kit + incentivo) = R$ 4.000
- Compensação de demanda (estimado 50% precisarão): R$ 2.000
- Total: R$ 6.000

### 6.2 Estratégia de Demanda (Aquisição de Clientes)

**Beta Fechado (Semanas 11-16):**

Quem:
- Funcionários de startups amigas
- Amigos/família (máx 20%)
- Moradores de condomínios parceiros (síndicos introduzidos pelo fundador)

Oferta: 50% de desconto em troca de feedback obrigatório + avaliação detalhada

Proibido nesta fase: Google Ads, Facebook Ads, qualquer canal que escale rápido.

**Cobertura Geográfica Inicial — 5 bairros (~120 mil habitantes):**
Brooklin, Moema, Vila Mariana, Itaim Bibi, Campo Belo. Raio total: ~5km². Prestador chega em <30min em qualquer ponto.

**Soft Launch e Expansão (Mês 6+):**

**Google Ads — Foco em Long-Tail de Alta Intenção:**
- Budget: R$ 15K/mês
- Palavras-chave: "eletricista brooklin urgente", "quanto custa trocar chuveiro", "encanador moema domingo"
- Meta: 240 clientes/mês | CAC R$ 60

**Indicação Gamificada:**
- Indicador recebe R$ 30 de crédito, indicado recebe R$ 30 de desconto
- 3 indicações → R$ 90 crédito (1 serviço grátis)
- 5 indicações → Tier VIP (5% desconto permanente)
- Meta: 180 clientes/mês | CAC R$ 40

**Parcerias Locais (Síndicos, Imobiliárias):**
- 5-10 prédios com síndico direto
- Dashboard exclusivo + linha de suporte direta
- Meta: 120 clientes/mês | CAC R$ 30

**SEO:**
- 50 landing pages: [serviço] + [bairro]
- Blog: 10 artigos/mês sobre tópicos de alta intenção
- Meta Mês 6: 60 clientes/mês | CAC R$ 10

**Roadmap de Marketing (Ano 1):**

| Mês | Foco | Canais Ativos | Budget | Meta Clientes Novos |
|---|---|---|---|---|
| 1-2 | Fundação | Direto (fundador) | R$ 2K | 20 |
| 3 | Beta Fechado | Indicação direta | R$ 4K | 60 |
| 4-6 | Expansão local | Google Ads + Indicação + Parcerias | R$ 15K/mês | 200-600 |
| 7-9 | Otimização | Ads + SEO + Indicação | R$ 25K/mês | 800-1.200 |
| 10-12 | Escala | Todos os canais | R$ 35K/mês | 1.500-2.000 |

**Total Investimento Marketing Ano 1:** R$ 300K

---

## 7. STACK TECNOLÓGICO

### 7.1 Decisões de Arquitetura

> **Documento Fonte:** Veja o arquivo `d:/Desktop/facilita/.planning/ARCHITECTURE.md` para o manifesto completo e detalhamento de código do modelo escolhido.

1. **O Modelo: "Modular Hexagonal Evolutivo":** Não é monolito de camadas tradicional e não é microserviço. É um único deploy dividido em Bounded Contexts autônomos, cada um com arquitetura hexagonal interna, que se comunicam por eventos de domínio e interfaces de aplicação.
2. **Isolamento de Domínio:** O Core Domain (TypeScript puro) não importa bibliotecas externas ou frameworks. O módulo A não acessa a infraestrutura do módulo B (ex: `Orders` não faz `prisma.payout.create()`, mas chama `IPaymentService`).
3. **Comunicação Cross-Module:** Síncrona (via Interface) apenas na mesma transação para consistência financeira (ex: autorizar cartão no ato do pedido). Assíncrona (via Event Bus) para fluxos desacoplados (ex: `OrderCompletedEvent` dispara atualização de score e liberação de repasse).
4. **Database — Schemas Isolados:** Um servidor PostgreSQL, mas com schemas estritamente isolados por módulo (`identity`, `catalog`, `orders`, `payments`, `evidence`, `fraud`).
5. **Strangler Fig Pattern:** A migração para microserviços ocorrerá de forma orgânica e cirúrgica apenas baseada em gargalos de operação (ex: extrair Matching no Mês 12-15 via Anti-Corruption Layers).
6. **Mobile nativo para o prestador:** App do prestador em React Native/Expo (iOS + Android). App do cliente em Next.js PWA.
7. **Offline-first no app do prestador:** Timeline de job deve funcionar sem conexão, sincronizando quando disponível.
8. **Arquitetura Multi-Cidade (Global-Ready):** Todas as entidades de negócio devem conter `city_id` e as parametrizações (taxas, raios) devem ser regionais.

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

### 7.2 Stack Detalhado

**Frontend**

| Componente | Tecnologia | Justificativa |
|---|---|---|
| App Cliente | Next.js 15 (PWA) | SEO, rapidez, App Router — cliente tem jornada menos crítica para notificações em tempo real |
| App Prestador | React Native + Expo | Push nativo iOS/Android confiável, câmera nativa, geolocalização em background, offline parcial |
| Backoffice | Next.js + TypeScript | Ecossistema maduro, dashboards complexos |
| Design System | Tailwind v4 com tokens customizados, Outfit + Inter | |
| Motion | Framer Motion | Micro-interações premium |
| State Management (web) | Zustand | Menos boilerplate |
| State Management (mobile) | Zustand + React Query | Cache e sincronização offline |

**Backend**

| Componente | Tecnologia | Justificativa |
|---|---|---|
| API | Node.js + NestJS | TypeScript end-to-end, estrutura escalável (Modular Monolith) |
| Database | PostgreSQL + PostGIS | ACID compliance e inteligência geoespacial com **Índices GIST** |
| Cache | Redis + Redis Geo | Heartbeat de prestadores e buscas geográficas ultra-rápidas |
| Queue | BullMQ (sobre Redis) | Jobs assíncronos (AI, SMS, Payouts, Score Decay) |
| ORM | Prisma | Type-safe, migrations automáticas |
| Auth | JWT + Refresh Tokens | Stateless, escalável |
| Chat em tempo real | Stream.io (desde o dia 1, não "futuro") | R$ 1.200/mês, confiável, não vale reinventar WebSocket em tempo de MVP |

**Infraestrutura**

**MVP (até 600 pedidos/mês):**

| Componente | Tecnologia | Custo |
|---|---|---|
| Backend | Render.com | R$ 600/mês |
| Database | Supabase (PostgreSQL) | R$ 400/mês |
| Cache | Upstash (Redis) | R$ 200/mês |
| Frontend web | Vercel | R$ 200/mês |
| Storage (fotos) | AWS S3 + CloudFront | R$ 400/mês |
| **Total MVP** | | **R$ 1.800/mês** |

**Escala (2.000+ pedidos/mês):**

| Componente | Tecnologia | Custo |
|---|---|---|
| Compute | AWS ECS Fargate | R$ 1.200/mês |
| Database | RDS PostgreSQL t3.medium | R$ 800/mês |
| Cache | ElastiCache Redis | R$ 400/mês |
| Storage | S3 + CloudFront | R$ 800/mês |
| Monitoring | CloudWatch + Sentry | R$ 400/mês |
| CI/CD | GitHub Actions | R$ 100/mês |
| **Total Escala** | | **R$ 5.500/mês** |

**Serviços Terceiros**

| Serviço | Provider | Custo | Uso |
|---|---|---|---|
| Pagamentos + Split | Pagar.me | 2,5% + R$ 0,35 | Gateway + Split automático para MEI |
| SMS/OTP | Twilio | R$ 0,30/SMS | Verificação + notificações críticas |
| Email | SendGrid | R$ 200/mês | Transacional (até 40K/mês) |
| Push Notification | Expo Notifications (nativo) | Gratuito | iOS + Android via React Native |
| Chat em tempo real | Stream.io | R$ 1.200/mês | Chat cliente-prestador desde o MVP |
| KYC | Truora | R$ 15/verificação | Onboarding prestador |
| Background Check | Checagem.com | R$ 30/consulta | Antecedentes criminais |
| Device Fingerprint | Fingerprint.com | R$ 800/mês | Antifraude (até 100K requests) |
| Image Recognition | Google Vision API | R$ 1,50/1K imagens | Detecção foto reciclada |
| Image Duplicate | TinEye API | R$ 300/mês | Foto de estoque |
| Maps/Geocoding | Google Maps API | R$ 1.000/mês | Endereços + roteamento |
| Analytics | Mixpanel | R$ 500/mês | Produto (eventos, <10K users) |
| Error Tracking | Sentry | R$ 200/mês | Bugs em produção |
| Feature Flags | PostHog (open-source) | R$ 0 (self-hosted) | Controle de rollout |

### 7.3 Arquitetura de Dados (Completa)

Todas as entidades necessárias para o produto funcionar desde o dia 1, sem migrations disruptivas.

```
┌─────────────┐
│   User      │ (Cliente ou Prestador)
├─────────────┤
│ id          │
│ type        │ (customer | provider)
│ phone       │
│ email       │
│ cpf         │
│ verified_at │
│ risk_score  │
│ created_at  │
│ last_active_at│
└─────────────┘
       │
       │ 1:N
       ▼
┌───────────────────┐         ┌───────────────────┐
│  ServiceCatalog   │         │  MaterialCatalog  │
├───────────────────┤         ├───────────────────┤
│ id                │         │ id                │
│ name              │         │ name              │
│ category          │         │ unit_price        │
│ description       │         │ category_id       │
│ base_price        │         │ markup_percentage │
│ duration_minutes  │         └───────────────────┘
│ includes          │
│ excludes          │
│ active            │
│ phase             │ (beta | soft_launch | full)
│ created_at        │
└───────────────────┘

┌─────────────┐
│  Provider   │ (extends User via user_id)
├─────────────┤
│ id          │
│ user_id     │
│ tier        │ (1, 2, 3)
│ score       │ (0-100, janela 90 dias)
│ active      │
│ categories  │ (array de service_ids)
│ radius_km   │
│ verified_at │
│ mei_cnpj    │ (obrigatório)
│ mei_verified│
│ bank_account_verified_at │
│ last_active_at │
└─────────────┘
       │
       │ 1:N
       ▼
┌────────────────┐      ┌──────────────────────┐
│ ProviderDoc    │      │ ProviderAvailability  │
├────────────────┤      ├──────────────────────┤
│ id             │      │ id                   │
│ provider_id    │      │ provider_id          │
│ type           │      │ day_of_week          │ (0-6)
│ (rg|selfie|    │      │ start_time           │
│  background|   │      │ end_time             │
│  mei_cert)     │      │ is_available         │
│ url            │      └──────────────────────┘
│ verified       │
│ verified_by    │      ┌──────────────────────┐
└────────────────┘      │ ProviderWallet       │
                        ├──────────────────────┤
                        │ id                   │
                        │ provider_id          │
                        │ available_balance    │
                        │ pending_balance      │
                        │ total_earned         │
                        │ updated_at           │
                        └──────────────────────┘

┌─────────────┐
│  Order      │
├─────────────┤
│ id          │
│ customer_id │
│ provider_id │ (null até match)
│ service_id  │
│ status      │ (enum — ver abaixo)
│ base_price  │
│ additional_total │
│ total       │
│ address_id  │
│ urgency     │ (normal | urgent)
│ scheduled_at│
│ accepted_at │
│ started_at  │
│ completed_at│
│ cancelled_at│
│ cancellation_reason │
│ cancelled_by │ (customer | provider | system)
│ created_at  │
└─────────────┘

Order.status enum:
pending → matched → scheduled → provider_enroute →
provider_arrived → in_execution → pending_additional_approval →
pending_customer_approval → approved → disputed → cancelled

       │
       ├─ 1:N
       ▼
┌──────────────────┐      ┌──────────────────┐
│  OrderTimeline   │      │  OrderAdditional │
├──────────────────┤      ├──────────────────┤
│ id               │      │ id               │
│ order_id         │      │ order_id         │
│ status           │      │ reason           │
│ timestamp        │      │ description      │
│ synced_at        │ ←offline│ value          │
│ metadata (JSON)  │      │ photo_urls (array)│
│  (lat/lng, notes)│      │ status           │
└──────────────────┘      │ (pending|approved│
                          │  |rejected)       │
                          │ requested_at     │
                          │ responded_at     │
                          └──────────────────┘

┌──────────────────┐
│  OrderEvidence   │
├──────────────────┤
│ id               │
│ order_id         │
│ type             │ (before | after | additional)
│ url              │
│ metadata (JSON)  │ (EXIF, geolocation, timestamp)
│ quality_score    │ (0-10: manual nos primeiros 200 jobs, auto depois)
│ vision_hash      │ (Google Vision — para detecção de reciclagem)
│ uploaded_at      │
│ reviewed_by      │ (user_id do operador, se revisão manual)
└──────────────────┘

┌─────────────────┐
│  Review         │
├─────────────────┤
│ id              │
│ order_id        │
│ customer_id     │
│ provider_id     │
│ overall_score   │ (1-5)
│ punctuality     │ (1-5)
│ quality         │ (1-5)
│ cleanliness     │ (1-5)
│ friendliness    │ (1-5)
│ comment         │
│ created_at      │
└─────────────────┘

┌─────────────┐
│  Dispute    │
├─────────────┤
│ id          │
│ order_id    │
│ opened_by   │ (customer | provider)
│ reason      │
│ description │
│ evidence    │ (JSON: photos, timeline)
│ status      │ (open | analyzing | resolved)
│ decision    │ (customer | provider | split | reexecution)
│ decided_by  │ (user_id do operador)
│ resolution_notes │
│ resolved_at │
│ sla_deadline │
└─────────────┘

┌──────────────┐
│  Payment     │
├──────────────┤
│ id           │
│ order_id     │
│ amount       │
│ refunded_amount │ (para estornos parciais em split decision)
│ method       │ (card | pix)
│ status       │ (authorized | captured | refunded | partially_refunded)
│ gateway_id   │ (Pagar.me transaction_id)
│ authorized_at│
│ captured_at  │
│ refunded_at  │
└──────────────┘

┌──────────────┐         ┌──────────────┐
│  Payout      │         │  PayoutOrder │
├──────────────┤         ├──────────────┤
│ id           │──1:N───→│ id           │
│ provider_id  │         │ payout_id    │
│ wallet_id    │         │ order_id     │
│ amount       │         │ amount       │
│ status       │         └──────────────┘
│ (scheduled|  │
│  processing| │
│  paid)       │
│ scheduled_at │
│ paid_at      │
└──────────────┘

┌────────────────┐
│  FraudSignal   │
├────────────────┤
│ id             │
│ entity_type    │ (user | order)
│ entity_id      │
│ signal_type    │ (duplicate_device | phone_in_chat |
│                │  recycled_photo | collusion_suspect |
│                │  abusive_additional | chargeback)
│ severity       │ (low | medium | high | critical)
│ metadata (JSON)│
│ reviewed       │
│ reviewed_by    │
│ action_taken   │
│ created_at     │
└────────────────┘

┌────────────────┐
│ Notification   │
├────────────────┤
│ id             │
│ user_id        │
│ type           │ (push | sms | email | in_app)
│ title          │
│ body           │
│ status         │ (sent | delivered | failed)
│ sent_at        │
│ delivered_at   │
│ metadata (JSON)│ (order_id, etc.)
└────────────────┘
```

### 7.4 APIs Críticas

**Matching Algorithm — Com Cold-Start Handling**

```typescript
// POST /api/orders/match
async function matchOrder(orderId: string): Promise<MatchResult> {
  const order = await getOrder(orderId);
  
  // 1. Filtros Hard
  let eligibleProviders = await db.providers.findMany({
    where: {
      active: true,
      verified: true,
      categories: { has: order.serviceId },
      score: { gte: 60 },
    }
  });

  // 2. Cascata de Matching (PostGIS + Redis Geo)
  const matchingConfig = [
    { timeout: 300, radius: 5000, limit: 1 },  // T0: Melhor prestador no raio 5km
    { timeout: 600, radius: 8000, limit: 3 },  // T5: Expande p/ top 3 no raio 8km
    { timeout: 900, radius: 12000, limit: 5 }  // T10: Expande p/ top 5 no raio 12km
  ];

  for (const step of matchingConfig) {
    nearbyProviders = await db.$queryRaw`
      SELECT p.* FROM "Provider" p
      JOIN "User" u ON p.user_id = u.id
      WHERE u.active = true 
      AND p.verified = true
      AND p.status = 'AVAILABLE' -- Considera janelas de deslocamento
      AND p.categories @> ARRAY[${order.serviceId}]
      AND ST_DWithin(u.location, ${order.location}, ${step.radius})
      ORDER BY p.score DESC, ST_Distance(u.location, ${order.location}) ASC
      LIMIT ${step.limit}
    `;
    
    if (nearbyProviders.length > 0) {
      // Logic for background timeout and step escalation...
      break;
    }
  }

  // 3. Cold-Start: sem prestador disponível
  if (nearbyProviders.length === 0) {
    return handleNoProviderAvailable(order);
  }

  // 4. Scoring
  const scored = nearbyProviders.map(p => ({
    provider: p,
    score: calculateMatchScore(p, order)
  })).sort((a, b) => b.score - a.score);

  // 5. Retorna top 3 para o cliente escolher (ou top 1 se urgente)
  return {
    type: 'match',
    providers: order.urgency === 'urgent'
      ? [scored[0].provider]
      : scored.slice(0, 3).map(s => s.provider)
  };
}

async function handleNoProviderAvailable(order: Order): Promise<MatchResult> {
  if (order.urgency === 'urgent') {
    // Alerta imediato para backoffice + notifica cliente de delay
    await notifyBackoffice('urgent_no_provider', order.id);
    await notifyCustomer(order.customerId, 'urgent_delay', {
      estimatedDelay: '30-60 min'
    });
    return { type: 'queued', estimatedWait: 60 };
  }
  
  // Pedido normal: entra em fila com SLA de 2h
  await db.orders.update({
    where: { id: order.id },
    data: { status: 'pending', queuedAt: new Date() }
  });
  
  await notifyCustomer(order.customerId, 'queued', {
    message: 'Estamos encontrando o melhor profissional para você. Confirmamos em até 2h.'
  });
  
  return { type: 'queued', estimatedWait: 120 };
}

function calculateMatchScore(provider: Provider, order: Order): number {
  let score = 0;

  // Distância (40 pts)
  const distance = calculateDistance(provider.location, order.address);
  score += Math.max(0, 40 - (distance * 4));

  // Score do prestador (30 pts) — janela 90 dias
  score += provider.score * 0.3;

  // Tier (10 pts)
  score += provider.tier === 3 ? 10 : provider.tier === 2 ? 5 : 0;

  // Especialização por categoria (10 pts)
  const jobsInCategory = provider.stats[order.serviceId] || 0;
  score += Math.min(10, jobsInCategory / 2);

  // Disponibilidade imediata (10 pts)
  score += provider.availableNow ? 10 : 0;

  return score;
}
```

**Detecção de Contato no Chat**

```typescript
// Webhook: onChatMessage (Stream.io)
async function detectContactInChat(message: ChatMessage) {
  const patterns = [
    /\d{2}\s?\d{4,5}-?\d{4}/, // telefone
    /\d{11}/,                   // celular sem formatação
    /whats(app)?/i,
    /\bzap\b/i,
    /chama\s+(no|la)/i,
    /instagram|insta/i,
    /@\w{3,}/,                  // @ de redes sociais
    /pix\s*(direto|fora)/i,     // pix externo
  ];

  const detected = patterns.some(p => p.test(message.content));
  if (!detected) return;

  // Mascarar mensagem
  await streamClient.updateMessage({
    id: message.id,
    text: '[CONTEÚDO BLOQUEADO — Contato externo não é permitido na FACILITA]',
    flagged: true
  });

  await sendWarning(message.userId, 'contact_attempt');

  await db.fraudSignals.create({
    data: {
      entityType: 'user',
      entityId: message.userId,
      signalType: 'phone_in_chat',
      severity: 'medium',
      metadata: { orderId: message.orderId, snippet: message.content.slice(0, 50) }
    }
  });

  // Escalada por recorrência
  const recentSignals = await db.fraudSignals.count({
    where: {
      entityId: message.userId,
      signalType: 'phone_in_chat',
      createdAt: { gte: subDays(new Date(), 30) }
    }
  });

  if (recentSignals >= 3) await suspendUser(message.userId, 7);
}
```

### 7.5 Cronograma de Desenvolvimento (Integrado com Go-to-Market)

> **Princípio:** Vertical Slice — cada sprint entrega um fluxo funcional ponta a ponta para uma fatia do produto. Nunca camadas horizontais. Feature flags controlam o que está visível para usuários externos.

**Sprint 0 — Semanas 1-2: Decisões e Setup (não é código)**
- ✅ Gateway: Pagar.me selecionado e contrato assinado
- ✅ Consulta jurídica: estrutura da garantia (não-seguro), contrato MEI, parceria prestador
- ✅ Schema Prisma completo (todas as entidades acima) revisado
- ✅ Stack mobile confirmado: React Native/Expo para prestador
- ✅ Infraestrutura: Render + Supabase + Upstash + Vercel
- ✅ Repositórios: monorepo (apps/cliente, apps/prestador, apps/backoffice, backend)
- ✅ CI/CD básico: GitHub Actions
- ✅ Design system: Tailwind v4 + Framer Motion
- Meta operacional: 5 prestadores identificados para recrutar

**Sprint 1 — Semanas 3-5: Autenticação + Onboarding (Fatia 1)**
- ✅ Cadastro cliente (PWA)
- ✅ Cadastro prestador (React Native/Expo)
- ✅ OTP via Twilio
- ✅ JWT + refresh tokens
- ✅ Validação de MEI via API gov.br
- ✅ Backoffice: aprovação manual de prestador
- ✅ KYC manual (sem Truora ainda — operador revisa documentos)
- Meta operacional: 10 prestadores cadastrados e aprovados manualmente

**Sprint 2 — Semanas 6-8: Catálogo + Pedido (Fatia 2 — só Elétrica)**
- ✅ Entidade ServiceCatalog no banco
- ✅ Catálogo: 6 serviços de elétrica (flag: beta)
- ✅ Formulário de pedido + triagem guiada
- ✅ Upload de fotos (câmera nativa no app prestador; câmera/galeria no cliente)
- ✅ Criação de pedido
- ✅ Backoffice: visualização de pedidos + matching manual
- Meta: 5 pedidos internos simulados

**Sprint 3 — Semanas 9-11: Execução + Chat (Fatia 3)**
- ✅ Timeline operacional no app do prestador (com suporte offline + sync)
- ✅ Chat em tempo real (Stream.io — desde o início, não "futuro")
- ✅ Notificações push nativas (Expo Notifications) para prestador
- ✅ Matching algorithm básico (com cold-start handling)
- ✅ Aceite de job (janela 15 min)
- ✅ Fluxo de recusa com motivo obrigatório

**Sprint 4 — Semanas 12-14: Pagamento + Evidência (Fatia 4)**
- ✅ Integração Pagar.me: autorização, captura, split
- ✅ Subconta do prestador no Pagar.me (por MEI)
- ✅ Carteira do prestador (ProviderWallet)
- ✅ Upload de evidência com metadata EXIF
- ✅ Checklist de qualidade de evidência (manual — backoffice revisa 100% dos primeiros 200 jobs)
- ✅ Solicitação de adicional + aprovação + cobrança
- ✅ Taxa de urgência
- Meta: **5 pedidos reais com pagamento real (clientes beta de confiança, valores normais)**

**Sprint 5 — Semanas 15-17: Pós-Serviço + Garantia (Fatia 5)**
- ✅ Avaliação multidimensional (entidade Review)
- ✅ Sistema de score com janela 90 dias
- ✅ Fluxo de disputa completo (abertura + resolução backoffice)
- ✅ Garantia: acionamento + retorno do prestador + escalada
- ✅ Fluxo de reatribuição por cancelamento tardio
- ✅ Dashboard de operação (métricas diárias, fila de ação)
- Meta: 30 pedidos beta com fluxo completo end-to-end

**Sprint 6 — Semanas 18-20: Antifraude + KYC Automatizado (Fatia 6)**

> **⚠️ Este sprint é bloqueante para abertura a qualquer usuário externo. Não abrir o produto publicamente sem estes itens 100% funcionando.**

- ✅ KYC automatizado (Truora)
- ✅ Background check (Checagem.com)
- ✅ Device fingerprinting (Fingerprint.com)
- ✅ Detecção de contato no chat (Stream.io webhook)
- ✅ Google Vision API (reverse image search)
- ✅ TinEye API (foto de estoque)
- ✅ Painel de antifraude no backoffice
- ✅ Score de risco (cliente + prestador)
- ✅ Feature flags para controle de rollout

**Sprint 7 — Semanas 21-22: Beta Fechado (só Elétrica, 5 bairros)**
- Máximo 50 clientes selecionados
- 100% dos jobs com supervisão de backoffice em tempo real
- Todos os bugs críticos corrigidos em 24h (não em "próxima sprint")
- Operador de plantão em horário comercial completo
- Meta de saída: 80 pedidos concluídos | NPS >50 | Conclusão >70% | Disputas <5%

**Sprint 8 — Semanas 23-24: Soft Launch**
- Expansão do catálogo: Hidráulica + Pequenos Reparos (via feature flag)
- Google Ads ativo (budget R$ 5K)
- Programa de indicação ativo
- KYC e antifraude 100% automatizados
- Meta: 200 pedidos no mês

**Total: 24 semanas (~6 meses) até Soft Launch**

**Equipe Mínima:**
- 2 devs full-stack senior (React Native + Node.js/NestJS)
- 1 product manager (pode ser fundador nas primeiras 12 semanas)
- 1 designer UX/UI (freelancer part-time, R$ 10K total)
- 2 operadores (contratados na semana 14, para o beta)

**Custo de Desenvolvimento (24 semanas):**

| Item | Valor |
|---|---|
| 2 devs senior (R$ 16-18K cada × 6 meses) | R$ 200.000 |
| Product manager (R$ 12K × 6 meses) | R$ 72.000 |
| Designer (freelancer) | R$ 10.000 |
| Infraestrutura MVP | R$ 10.800 |
| Licenças e APIs (Stream.io, Sentry, etc.) | R$ 15.000 |
| **Total Desenvolvimento** | **R$ 307.800** |
