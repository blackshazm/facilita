FACILITA v4.1 — Resolução Integral das 112 Lacunas + Bloco F
Status: Fonte Única da Verdade (Substitui regras conflitantes do PRD v3.1 e Manual 3.1-PROD)
Data: 12 de Novembro de 2026
Escopo: Resolução completa, item por item (#1 a #112 + Bloco F), com especificações de regra de negócio, banco de dados, financeiro e jurídico.
BLOCO A — RESOLUÇÃO DAS 32 CONTRADIÇÕES DE REGRA DE NEGÓCIO (#1 a #32)
A.1 — Regras Financeiras Unificadas (#1 a #9)
#
Regra
Resolução Canônica Definitiva (Aplicar em Código + Contrato)
1
Garantia
90 dias corridos (alinhado ao Art. 26, II do CDC e já implementado na API). Estruturada exclusivamente como Política de Reexecução/Satisfação pela plataforma, nunca como seguro.
2
Comissão (Take Rate)
20% padrão (Tiers Bronze e Prata) e 18% (Tier Ouro). Recibo, contrato e split Pagar.me devem exibir exatamente essa porcentagem.
3
Taxa de Deslocamento / Cancelamento
Valor único de R$ 35,00 (R$ 28,00 repassados ao prestador + R$ 7,00 cobertura operacional/gateway). Removidos os valores R$ 20, R$ 30 e R$ 40.
4
Gatilho de Cancelamento
Grátis até 5 minutos após o aceite (para pedidos urgentes) OU até 2h antes do horário agendado (desde que o prestador não tenha clicado em "Saí para atendimento"). Fora dessa janela, aplica-se a taxa única de R$ 35,00.
5
Repasse por Tier
Bronze: D+3 via Pix · Prata: D+2 via Pix · Ouro: D+1 via Pix. Eliminado D+15 e D+7.
6
Taxa de Urgência
R$ 40,00 fixo (atendimento em até 4h). Eliminada a variação "+25%" e "R$ 25".
7
Antecipação de Recebíveis
Removida do MVP. Repasse em D+1/D+2/D+3 via Pix torna a antecipação desnecessária e elimina spread não contratado.
8
Custo Variável por Pedido
Unificado em R$ 24,51/pedido (incluindo tributos da plataforma, Pagar.me, provisão de garantia 90d, chargeback, suporte, proxy e seguro AP).
9
Provisão de Garantia
4% sobre o GMV (R$ 6,40 por pedido médio de R$ 160,00), coerente com acionamento estimado de ~8% dos pedidos a custo médio de R$ 80,00 (0,08 × 80 = R$ 6,40).

A.2 — Regras Operacionais Unificadas (#10 a #17)
#
Regra
Resolução Canônica Definitiva
10
Quantidade de Tiers
Exatamente 3 Tiers: 1 = Bronze, 2 = Prata, 3 = Ouro. Removido o Tier "Diamante" da interface e documentação.
11
Janela de Aceite
180 segundos (3 minutos) por onda de oferta. Meta de KPI ajustada para tempo médio de aceite menor que 3 minutos.
12
Score Mínimo e Evolução
Todo prestador aprovado no KYC inicia com score = 65 (acima do minScore: 60 do matching). Prata exige score ≥ 70; Ouro exige score ≥ 80.
13
Fotos Obrigatórias
Mínimo 1 foto ANTES (para liberar IN_PROGRESS) + 1 foto DEPOIS (para liberar COMPLETED) em 100% dos pedidos — unificado nas 3 camadas de validação.
14
Foto em Serviços ≤ R$ 80
Removida a exceção > R$ 80. Todos os serviços, de qualquer valor, exigem foto antes/depois para ter validade de garantia.
15
Limite de Adicional Abusivo
Qualquer adicional > 100% do valor base trava automaticamente para revisão manual do operador (removida a menção a > 150%).
16
Escopo de Lançamento
Beta (Semanas 1–4): 5 serviços de Elétrica (excluindo quadro/disjuntor para quem não tem NR-10). Soft Launch: 13 serviços completos.
17
Upload da Galeria pelo Cliente
Bloqueado upload da galeria na abertura de disputa/garantia pelo cliente: exige captura de câmera ao vivo no navegador (PWA) com timestamp.

A.3 — Metas, Gates e Cronograma Alinhados (#18 a #26)
#
Item
Resolução Canônica Definitiva
18
Pedidos no Mês 6
Alinhado para 200 pedidos/mês no Gate 2 do modelo enxuto Web/PWA (ou 600/mês apenas se houver operação B2B com 5+ imobiliárias ativas).
19
Gate 1 "Antifraude 100% Funcional"
No Gate 1 (80 jobs), o escopo obrigatório é: KYC verificado, máscara de telefone/chat regex, lock de aceite e câmera ao vivo com GPS. Google Vision e TinEye ficam explicitamente para a Fase 2 (> 200 jobs).
20
Comissão Mês 1
0% apenas nos primeiros 5 jobs de cada prestador fundador (não 30 dias ilimitados); projeção financeira ajustada para refletir R$ 0 de comissão nesses 5 jobs iniciais.
21
Garantia de Demanda
Removida a promessa de "8 jobs/mês" no Mês 1 (substituída pelo incentivo de 0% de comissão nos primeiros 5 jobs).
22
Compensação de Demanda (R$ 200)
Removida (custo R$ 0,00).
23
Custo até Soft Launch
Unificado para o modelo enxuto Web/PWA: ~R$ 600/mês de infra fixa (VPS + Domínio + Z-API), eliminando a folha de R$ 67.400/mês na fase de validação.
24
Break-even
No modelo enxuto (custo fixo ~R$ 1.000/mês com ferramentas): ~45 a 60 pedidos/mês. Se escalar para estrutura com folha de R$ 128 mil/mês, break-even real recalculado em ~11.500 a 15.700 pedidos/mês dependendo do mix B2B.
25
Payback vs. Break-even
Corrigido no TL;DR: Payback ocorre sempre após o break-even operacional acumulado.
26
Intervenção Manual
Meta realista por fase: 100% no Beta (80 jobs), < 50% no Mês 6 e < 20% no Mês 12 (após automação de KYC e Vision).

A.4 — Métricas e Contas Corrigidas (#27 a #32)
#
Métrica
Resolução Canônica Definitiva
27
LTV (Pitch e Dashboard)
Calculado estritamente sobre Margem de Contribuição, nunca sobre GMV. B2C: ~R$ 11,50/job × 2 jobs/ano = R$ 23,00/ano. B2B Imobiliária: ~R$ 25/job × 20 jobs/mês = R$ 500/mês de margem.
28
LTV/CAC
B2C via Google Ads pago (CAC R$ 48+) é inviável no início; meta de LTV/CAC ≥ 3x via Indicação + Orgânico (CAC ≤ R$ 10) e ≥ 8x no B2B (Imobiliárias/Condomínios).
29
Receita Bruta do Beta (80 jobs)
80 jobs × Ticket Médio R$ 160,00 = R$ 12.800,00 de GMV (com R$ 2.560,00 de receita líquida a 20%, descontando os 5 jobs gratuitos dos fundadores).
30
Take Rate Mês 12
20% base + receita de urgência (take rate efetivo consolidado de 22,5%, corrigindo o erro de 24% vs. 31%).
31
Base de Antecipação
R$ 0,00 (removida da projeção).
32
Churn em 90 dias
Removido o gate < 40% em 90 dias para B2C (categoria de baixa frequência anual). Substituído por Recompra Anual B2C ≥ 25% e Retenção Mensal B2B ≥ 90%.

BLOCO B — RESOLUÇÃO DOS 28 BUGS LÓGICOS E DE MODELO DE DADOS (#33 a #60)
B.1 — Correção dos 6 Bloqueadores Absolutos (#33 a #38)
#33 Prestador novo invisível: Campo score no model Provider alterado para @default(65), já acima do minScore: 60 do algoritmo de matching.
#34 Lock atômico no aceite: No AcceptOrderUseCase, o aceite executa dentro de prisma.$transaction um updateMany condicional: WHERE id = orderId AND status = 'MATCHING' AND provider_id IS NULL. Se result.count !== 1, lança ConflictException('Chamado já aceito por outro profissional').
#35 Telefone do cliente exposto: Removido o número de telefone real da tela do prestador. A comunicação ocorre via chat interno WebSocket (com filtro regex) ou via Call Proxy mascarado (Twilio Voice) usando número temporário que expira após a conclusão do serviço.
#36 Fluxo completo do Pix: Pix não possui pré-autorização. Fluxo definido: cliente seleciona Pix no checkout ➔ API cria cobrança dinâmica Pagar.me (QRCode + Copia-e-Cola com expiração de 15 min) e pedido entra em AWAITING_PAYMENT ➔ Webhook confirma pagamento ➔ pedido vai para PAID_ESCROW e entra no radar de matching. Se cancelar dentro da regra grátis, API executa estorno automático via Pagar.me.
#37 Falha de captura no cartão: A captura (ou retenção confirmada) no cartão ocorre no momento em que o prestador clica em Iniciar Execução (após foto ANTES), ou o pedido é pago antecipado em PAID_ESCROW antes do despacho. Se a cobrança falhar antes do início, o serviço não é iniciado e o cliente é notificado para trocar o método.
#38 CPF ausente no cadastro e KYC do cliente: cpf_hash e cpf_encrypted são opcionais (String?) na criação da conta do cliente para não travar o onboarding, mas tornam-se obrigatórios no primeiro checkout (para emissão de Pix/Cartão e antifraude). Para o prestador, CPF + MEI são obrigatórios no cadastro.
B.2 — Correção Completa do Schema Prisma (#39 a #49 + #53 + #59)
Abaixo está o ajuste estrutural definitivo do schema.prisma resolvendo os itens #38 a #49, #53 e #104:

Criado o model Address (#40) com complement obrigatório (#74) e coordenadas lat/lng.
Declarados todos os 17 enums (#41).
Adicionados base_lat, base_lng, current_lat, current_lng e score @default(65) em Provider (#33, #42).
Alterado daily_job_limit para Int? nullable com padrão null (#39, #104).
Removido @unique de Payment.order_id (#43), Dispute.order_id (#44) e substituído em Review por @@unique([order_id, provider_id]) (#45).
Adicionado provider_id em OrderEvidence (#46).
Adicionada @relation em Payout.wallet_id (#47) e version Int @default(0) em ProviderWallet para lock otimista (#48).
Removido cpf em texto puro de User, mantendo apenas cpf_hash (HMAC-SHA256) e cpf_encrypted (AES-256-GCM) (#49, #52).
Adicionada tabela ProcessedWebhook para idempotência (#53).

enum UserType { CUSTOMER PROVIDER OPERATOR }
enum OrderStatus { AWAITING_PAYMENT MATCHING ACCEPTED IN_TRANSIT ARRIVED IN_PROGRESS AWAITING_ADDITIONAL COMPLETED CANCELLED DISPUTED }
enum Urgency { NORMAL URGENT }
enum CancelledBy { CUSTOMER PROVIDER SYSTEM }
enum EvidenceType { BEFORE AFTER ADDITIONAL DISPUTE }
enum AdditionalStatus { PENDING APPROVED REJECTED MANUAL_REVIEW }
enum DisputeSide { CUSTOMER PROVIDER }
enum DisputeStatus { OPEN ANALYZING RESOLVED }
enum DisputeDecision { CUSTOMER PROVIDER SPLIT REEXECUTION }
enum DocType { RG SELFIE BACKGROUND MEI_CERT NR10_CERT }
enum PaymentMethod { CARD PIX }
enum PaymentStatus { AWAITING_PAYMENT AUTHORIZED PAID_ESCROW CAPTURED REFUNDED PARTIALLY_REFUNDED FAILED }
enum PayoutStatus { SCHEDULED PROCESSING PAID FAILED }
enum FraudType { DUPLICATE_DEVICE PHONE_IN_CHAT RECYCLED_PHOTO OFF_PLATFORM_OFFER CONLUIO }
enum Severity { LOW MEDIUM HIGH CRITICAL }
enum NotificationType { PUSH WHATSAPP SMS EMAIL IN_APP }
enum NotificationStatus { QUEUED SENT DELIVERED FAILED }

model User {
  id            String    @id @default(uuid())
  type          UserType
  phone         String    @unique
  email         String?   @unique
  cpf_hash      String?   @unique // HMAC-SHA256 via chave KMS (nunca texto puro)
  cpf_encrypted String?   // AES-256-GCM
  verified_at   DateTime?
  risk_score    Int       @default(0)
  last_active_at DateTime?
  created_at    DateTime  @default(now())

  sessions      Session[]
  addresses     Address[]
}

model Address {
  id           String   @id @default(uuid())
  user_id      String
  label        String   // Casa, Trabalho, Outro
  street       String
  number       String
  complement   String   // Obrigatório (apto/bloco/casa)
  neighborhood String
  city         String
  state        String
  zip_code     String
  lat          Decimal  @db.Decimal(10, 7)
  lng          Decimal  @db.Decimal(10, 7)
  created_at   DateTime @default(now())

  user         User     @relation(fields: [user_id], references: [id])
  @@index([user_id])
}

model Provider {
  id                       String    @id @default(uuid())
  user_id                  String    @unique
  tier                     Int       @default(1) // 1=Bronze, 2=Prata, 3=Ouro
  score                    Int       @default(65) // Nasce > minScore (60)
  active                   Boolean   @default(false)
  nr10_verified            Boolean   @default(false)
  base_lat                 Decimal   @db.Decimal(10, 7)
  base_lng                 Decimal   @db.Decimal(10, 7)
  current_lat              Decimal?  @db.Decimal(10, 7)
  current_lng              Decimal?  @db.Decimal(10, 7)
  radius_km                Int       @default(5)
  daily_job_limit          Int?      // Nullable e null por padrão (sem trava CLT)
  mei_cnpj                 String?   @unique
  mei_verified             Boolean   @default(false)
  verified_at              DateTime?
  bank_account_verified_at DateTime?
  categories               String[]

  wallet                   ProviderWallet?
  @@index([score, active])
  @@index([base_lat, base_lng])
}

model ProviderWallet {
  id                String   @id @default(uuid())
  provider_id       String   @unique
  available_balance Decimal  @default(0) @db.Decimal(10, 2)
  pending_balance   Decimal  @default(0) @db.Decimal(10, 2)
  total_earned      Decimal  @default(0) @db.Decimal(10, 2)
  version           Int      @default(0) // Lock otimista + SELECT FOR UPDATE
  updated_at        DateTime @updatedAt

  provider          Provider @relation(fields: [provider_id], references: [id])
  payouts           Payout[]
}

model Payment {
  id              String        @id @default(uuid())
  order_id        String        // 1:N (suporta pagamento base + adicionais)
  type            String        // BASE | ADDITIONAL | CANCELLATION_FEE
  amount          Decimal       @db.Decimal(10, 2)
  refunded_amount Decimal       @default(0) @db.Decimal(10, 2)
  method          PaymentMethod
  status          PaymentStatus
  gateway_id      String?
  pix_qr_code     String?
  pix_copy_paste  String?
  expires_at      DateTime?
  created_at      DateTime      @default(now())

  @@index([order_id])
}

model Payout {
  id           String       @id @default(uuid())
  provider_id  String
  wallet_id    String
  amount       Decimal      @db.Decimal(10, 2)
  status       PayoutStatus
  scheduled_at DateTime
  paid_at      DateTime?
  created_at   DateTime     @default(now())

  wallet       ProviderWallet @relation(fields: [wallet_id], references: [id])
}

model OrderEvidence {
  id            String       @id @default(uuid())
  order_id      String
  provider_id   String       // Identifica o autor em caso de reexecução
  type          EvidenceType
  url           String
  metadata      Json         // { lat, lng, accuracy, capturedAt }
  quality_score Int?
  uploaded_at   DateTime     @default(now())
}

model Review {
  id            String   @id @default(uuid())
  order_id      String
  customer_id   String
  provider_id   String
  overall_score Int
  comment       String?
  created_at    DateTime @default(now())

  @@unique([order_id, provider_id]) // Permite avaliar reexecução
}

model Dispute {
  id           String           @id @default(uuid())
  order_id     String           // 1:N (permite disputa + acionamento posterior de garantia)
  opened_by    DisputeSide
  reason       String
  description  String
  status       DisputeStatus
  decision     DisputeDecision?
  sla_deadline DateTime
  created_at   DateTime         @default(now())

  @@index([order_id])
}

model ProcessedWebhook {
  event_id     String   @id // Idempotência estrita contra reentregas do gateway
  provider     String
  processed_at DateTime @default(now())
}
B.3 — Segurança Estrutural e Infraestrutura (#50 a #60)
#50 AuditLog automático: Substituído o interceptor opcional por Prisma Client Extension ($extends) na camada de persistência que grava obrigatoriamente qualquer mutação em Order, Payment, Payout, Dispute, Provider e User.
#51 Registro de tentativas negadas: Criado SecurityAuditFilter (Global Exception Filter) que registra todo 401, 403, 429 e tentativa de transição inválida de estado no AuditLog.
#52 Hash de CPF com KMS: Substituído sha256(cpf + salt) por HMAC-SHA256 usando chave rotacionável isolada (PII_HMAC_KEY).
#53 Idempotência de Webhook: Todo webhook verifica ProcessedWebhook.findUnique({ where: { event_id } }) dentro de transação antes de alterar Payment.
#54 Testes de Concorrência e Carga: Adicionada suíte Jest com Promise.all simulando 10 aceites simultâneos no mesmo pedido + script k6 de carga no /orders e /webhooks/pagarme.
#55 Rollback de Migration: Pipeline CI exige geração de script reverso (prisma migrate diff --to-schema-datamodel) antes de aplicar em produção.
#56 Gateway Secundário e Liquidez: PaymentGatewayPort implementado com PagarmeAdapter (primário) e AsaasAdapter (secundário via feature flag), somado à reserva de liquidez de 5% do GMV em conta PJ separada.
#57 Fim do last-write-wins: Adicionado campo sequence Int no OrderTimeline e validação estrita de máquina de estados no domínio (rejeita transições fora de ordem).
#58 estimatedWaitMinutes dinâmico: Calculado em tempo real com base no número de prestadores ativos no raio e na média móvel dos últimos 20 pedidos da região.
#59 Background Location removido: Eliminado ACCESS_BACKGROUND_LOCATION e expo-task-manager com foco 100% Web/PWA, capturando localização apenas sob ação explícita do usuário (Saí, Cheguei, Foto).
#60 Contagem de Módulos Padronizada: Arquitetura oficial fixada em 7 Módulos de Domínio (Identity, Catalog, Orders, Providers, Payments, Fraud, Notifications) + Shared (infraestrutura transversal).
BLOCO C — RESOLUÇÃO DAS 27 FUNCIONALIDADES AUSENTES (#61 a #83)
C.1 — Receita e Conversão (#61 a #68)
#61 Máscara de Telefone (Call Proxy): Ocultação total do telefone na tela; ligações entre cliente e prestador roteadas via Twilio Voice Proxy com número mascarado temporário (ativo da aceitação até 2h após conclusão).
#62 Escopo Assinado Antes do Início: Ao chegar no local e tirar a foto ANTES, o sistema exibe o resumo exato do "Incluso e Não Incluso" e exige aceite digital (1 clique + timestamp) antes de iniciar a execução.
#63 Reagendamento: Criado endpoint POST /orders/:id/reschedule e botão no app do cliente/prestador permitindo alterar janela com ≥ 2h de antecedência sem cancelar o pagamento.
#64 Preço por Distância: Mantido preço fixo até 5 km; entre 5,1 km e 12 km aplica-se adicional transparente de R$ 3,00/km extra no checkout, repassado 100% ao prestador.
#65 Waitlist Real: Fila ordenada no Redis (ZADD) exibindo posição na fila e previsão calculada pelo término dos atendimentos em andamento na região.
#66 Sinal / Depósito: Substituído pelo fluxo Pix Antecipado / Pré-Autorização integral de 100% no checkout; em caso de cancelamento tardio, a taxa de R$ 35 fica retida e é dividida (R$ 28 prestador / R$ 7 plataforma).
#67 Sensor de Desintermediação: Adicionada pergunta obrigatória pós-serviço de 1 clique: "O profissional propôs pagamento por fora do FACILITA?" — respostas "Sim" geram sinal CRITICAL no módulo Fraud.
#68 Programa de Fidelidade: Cashback simples de 5% em créditos na carteira a partir do 2º pedido concluído (válido por 180 dias).
C.2 — Operação e Prova (#69 a #75)
#69 Gravação de Chamada do Operador: Toda ligação de disputa realizada pelo operador via painel utiliza Twilio Voice com gravação automática anexada ao Dispute.evidence (com aviso legal de gravação).
#70 Ouvidoria: Criada rota /support no app para reclamações gerais fora de disputa, com geração de protocolo e SLA de 24h.
#71 NPS de Prestador: Disparo automático trimestral no Cockpit do Prestador com pergunta de 0–10 + campo aberto.
#72 Gestão de Materiais: Eliminado o limbo dos R$ 30 sem aprovação: R$ 20 de consumíveis já estão no preço base; peças extras exigem foto da nota fiscal via câmera ao vivo e aprovação prévia do cliente.
#73 Sazonalidade / Surge: Adicionada tabela de multiplicador dinâmico (surge_multiplier de 1.0x a 1.25x) ativável por categoria/região em dias de pico (ex.: chuva intensa ou verão), repassada ao prestador.
#74 Validação de Complemento: Campo complement obrigatório no model Address (ex.: Bloco, Apto, Casa dos fundos) antes de confirmar o pedido.
#75 Trilha de Acesso a PII: Toda visualização de CPF ou documento KYC no /admin grava automaticamente um evento PII_ACCESSED no AuditLog com ID do operador, IP e justificativa.
C.3 — Pacote B2B Completo para Imobiliárias e Condomínios (#76 a #83)
#76 NFS-e Real: Integração com API municipal (Focus NFe / PlugNotas) para emissão automática de NFS-e sobre a taxa de intermediação (20%), substituindo o recibo via window.print().
#77 Definição Fiscal de Tomador: Plataforma atua juridicamente como Intermediária / Mandatária (tributa apenas os 20% de intermediação); o prestador MEI emite nota dos 80% diretamente para o tomador quando exigido pelo B2B.
#78 Multi-Imóvel por Conta: Suporte a contas COMPANY vinculadas a dezenas de registros Address (cada imóvel com código interno da imobiliária/condomínio).
#79 Alçada de Aprovação: Fluxo onde o síndico ou proprietário recebe um link único via WhatsApp para aprovar com 1 clique orçamentos/adicionais acima do limite pré-aprovado pela imobiliária.
#80 Faturamento Consolidado Mensal: Opção para clientes B2B aprovados fecharem faturas mensais consolidadas via boleto/Pix (D+15) com relatório detalhado por imóvel.
#81 SLA Contratual: Contrato B2B padrão com SLA de 4h para urgências e 24h para normais, sem multa punitiva acima do valor da taxa do chamado.
#82 API / Webhooks B2B: Endpoints POST /b2b/orders e webhook de status para integração futura com sistemas de gestão imobiliária (Superlógica/Vista).
#83 Contrato de Mandato: Minuta jurídica específica de Intermediação e Mandato de Pagamento substituindo o termo genérico "contrato de parceria".
BLOCO D — RESOLUÇÃO DAS 12 LACUNAS FINANCEIRAS (#84 a #95)
D.1 — Unit Economics Realista (Ticket Médio Base: R$ 160,00 | Urgência em 25%: +R$ 10,00 médio)
Receita Média por Pedido: R$ 32,00 (20% comissão) + R$ 10,00 (rateio urgência) = R$ 42,00.
Custos Variáveis Completos (Resolvendo #84 a #91):
#84 Provisão de Garantia 90 dias: R$ 6,40
#85 Provisão de Chargeback (1,5%): R$ 2,40
#86 Créditos Operacionais / Reatribuição: R$ 1,00
#87 Suporte Humano (30% × 15min): R$ 2,33
#88 Tributos sobre Receita da Plataforma (Simples ~11% sobre R$ 42): R$ 4,62
#89 Máscara de Telefone (Twilio Proxy): R$ 1,50
#90 Seguro Acidentes Pessoais (AP por job): R$ 0,63
Gateway Pagar.me (2,5% + R$ 0,35) + Infra/SMS: R$ 5,63
#91 Remoção de Dupla Contagem KYC: R$ 0,00 (alocado apenas no CAC do prestador).
Total Custo Variável Real: R$ 24,51 / pedido.
Margem de Contribuição Real por Pedido: R$ 17,49 (R$ 42,00 − R$ 24,51).
#92 Receita de Antecipação: R$ 0,00 (removida).
#93 Seguro Estendido R$ 9,90: R$ 0,00 (removido da projeção e do pitch deck).
D.2 — Capacidade de Oferta, Churn e Break-even (#94 e #95)
#94 Capacidade Real de Oferta: Estimativa corrigida de 40 para 25 jobs/prestador/mês (~1,1 job/dia útil considerando deslocamento). Para atender 200 pedidos/mês no lançamento enxuto, bastam 8 a 10 prestadores ativos; para 2.000 pedidos/mês, são necessários 80 prestadores ativos.
#95 Custo de Reposição por Churn: Provisionado churn mensal de 10% sobre a base ativa (sem custo de curso NR-10 pago pela plataforma; o profissional já deve possuir certificação).
Break-even Recalculado:
Operação Enxuta Bootstrapping (Custo Fixo R$ 800/mês): 46 pedidos/mês (viável já no Mês 1/2 atendendo 2 imobiliárias + demanda local).
Operação Estruturada c/ Equipe (se houver folha de R$ 128.000/mês): Exigiria 7.318 pedidos/mês com margem de R$ 17,49 (ou captação focada em B2B de ticket maior). Por isso, a diretriz oficial é manter a operação enxuta sem folha fixa pesada até validar 500+ pedidos/mês.
BLOCO E — RESOLUÇÃO DOS 13 RISCOS DE EXTINÇÃO JURÍDICA E FÍSICA (#96 a #112)
E.1 — Segurança Física e Seguros (#96 a #102)
#96 NR-10 Obrigatória: Serviços em quadro elétrico, disjuntores e circuitos energizados exigem upload de certificado NR-10 válido (DocType.NR10_CERT, nr10_verified: true). Prestadores sem NR-10 só visualizam serviços com disjuntor desligado (troca simples de chuveiro, luminária, suporte, hidráulica e montagem).
#97 Limite de Escopo Elétrico: Excluídos expressamente do catálogo e dos Termos: padrão de entrada, alta tensão, redes trifásicas e troca completa de fiação.
#98 Protocolo de Acidente com Vítima: Playbook operacional: (1) Acionamento imediato 192/193, (2) Notificação ao contato de emergência cadastrado do prestador, (3) Abertura de sinistro na apólice de Acidentes Pessoais, (4) Registro imutável de evidências.
#99 Seguro de Acidentes Pessoais (AP): Contratação de apólice coletiva intermitente por serviço ativo cobrindo o prestador durante o atendimento (~R$ 0,63/job já incluídos no custo variável).
#100 Apólice RC Profissional: Validação contratual prévia com seguradora garantindo cobertura expressa para erro de execução e danos materiais a terceiros (sem cláusula de exclusão de serviço prestado).
#101 Cliente Vulnerável / Menor de Idade: Checkbox obrigatório no checkout: "Confirmo ser maior de 18 anos e que haverá responsável maior de idade presente no imóvel durante todo o atendimento".
#102 Botão de Emergência Especificado: Ao acionar, exibe discagem rápida para 192 (SAMU), 193 (Bombeiros) e 190 (Polícia), e dispara alerta sonoro crítico no /admin com endereço exato e dados das partes.
E.2 — Blindagem Contra Vínculo Trabalhista (#103 a #109)
Eliminados os 7 indícios de subordinação do Art. 9º da CLT:

#103 Recusa sem penalidade: Peso da taxa de aceitação reduzido a 0% no score; recusar chamado nunca pune o prestador.
#104 Sem limite diário de jobs: daily_job_limit definido como null no banco.
#105 Fim da suspensão de 7 dias: Removida punição disciplinar de bloqueio por cancelamento/no-show; aplicada apenas redução temporária de prioridade de oferta no algoritmo (ou descadastramento contratual em caso de fraude/abandono recorrente).
#106 Sem pressão de disponibilidade: Substituído alarme contínuo impositivo por notificação padrão opcional de oferta de chamado (prestador fica online/offline quando quiser).
#107 Fim do GPS em segundo plano: Removida vigilância contínua; localização é colhida pontualmente apenas na chegada e na foto de evidência.
#108 Contratação MEI ou Autônomo (RPA): Aceita MEI ou autônomo regularizado, deixando explícita no contrato a ausência de exclusividade e a autonomia de agenda.
#109 Fim do Uniforme Obrigatório: Camisa/boné passam a ser opcionais (crachá digital no PWA substitui fardamento).
E.3 — Conformidade CDC e LGPD (#110 a #112)
#110 Prazo de Garantia CDC: Removida a cláusula de "24h para acionar"; cliente pode acionar a garantia a qualquer momento dentro dos 90 dias corridos (Art. 26 CDC).
#111 Direito de Arrependimento (Art. 49 CDC): Garantido cancelamento gratuito integral em até 7 dias para agendamentos futuros ainda não executados; para serviços imediatos executados no mesmo dia, o cliente assina ciência expressa de execução imediata antes do início.
#112 LGPD (Dado Criminal, Art. 20 e RIPD): Removida coleta automática de antecedentes criminais em massa sem base legal estrita; implementada opção de revisão humana obrigatória para qualquer bloqueio automático de conta (Art. 20 LGPD); elaborado RIPD (Relatório de Impacto à Proteção de Dados) cobrindo biometria KYC e evidências antes do lançamento público.
BLOCO F — RECALIBRAÇÃO DO ANTIFRAUDE (FIM DOS FALSOS POSITIVOS)
F1 — Remoção do Alerta "Cliente não voltou após job": Como a frequência natural de elétrica/hidráulica residencial é de 1 a 2 chamados por ano, não retornar em 90 dias é comportamento normal. Regra removida.
F2 — Remoção do Alerta "Prestador com recorrência < 10%": Substituído por cruzamento real de sinais: (1) Pesquisa pós-job "O profissional ofereceu por fora?", (2) Tentativa de contato no chat (regex), (3) Mesma conta/IP/dispositivo entre cliente e prestador, e (4) Taxa de cancelamento após aceite no mesmo endereço.

