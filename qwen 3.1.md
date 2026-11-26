# AUDITORIA COMPLETA DE LACUNAS — PROJETO FACILITA
## PRD v3.1 + Manual 3.1-PROD | Levantamento exaustivo com evidência documental
**Data:** 12/11/2026 | **Escopo:** 100% dos dois documentos | **Total de lacunas:** 112

---

## SUMÁRIO EXECUTIVO

| Categoria | Qtde | Severidade dominante |
|---|---|---|
| A. Contradições de regra de negócio | 32 | 🔴 Crítica |
| B. Bugs lógicos e de modelo de dados | 28 | 🔴 Crítica |
| C. Funcionalidades ausentes | 27 | 🟡 Alta |
| D. Lacunas financeiras / unit economics | 12 | 🔴 Crítica |
| E. Lacunas jurídicas e de segurança física | 13 | 🔴 Extinção |

**Diagnóstico:** o problema do FACILITA não é falta de código (88% implementado, testes verdes). É que **o documento não é internamente consistente** — a mesma regra tem 2, 3 ou 4 valores diferentes em seções distintas, e o código implementa uma versão enquanto o contrato descreve outra. Somado a isso, existem riscos de extinção (acidente elétrico, vínculo trabalhista) que não aparecem em nenhuma matriz.

---

# BLOCO A — CONTRADIÇÕES DE REGRA DE NEGÓCIO (32)

Cada linha é um bug de produto, não uma questão de opinião. Todas verificáveis no texto.

## A.1 — Regras financeiras com múltiplos valores

| # | Regra | Valores encontrados | Onde |
|---|---|---|---|
| 1 | **Garantia** | **30 dias** vs **90 dias (já implementado)** | §2.3, §4.4.3, §10.1 = 30d · §4.2.1, Manual M8, §14.3-A, Anexo A = 90d |
| 2 | **Comissão** | **18-25%** (tiers) vs **15%** (recibo) | §5.1 vs §4.2.1, §14.3-A, Manual M8 |
| 3 | **Taxa de deslocamento/cancelamento** | **R$20 / R$30 / R$35 / R$40** | §4.4.4 (20 e 40) · §4.2.1 (35) · §4.3.3 (40 cobra / 30 repassa) · §5.1 (20) |
| 4 | **Gatilho do cancelamento** | **"5 min do aceite"** (código) vs **"2h antes do agendamento"** (regra) | §4.2.1 vs §4.4.4 |
| 5 | **Repasse Tier 2** | **D+7** vs **D+3** | §4.4.6 vs §4.3.1 passo 35 |
| 6 | **Taxa de urgência** | **R$25 fixo** vs **+25%** | §5.1, §4.2.1 vs §4.2.2 |
| 7 | **Antecipação** | **2,5%/mês** vs **2,5% e 2,0% por operação** | §5.1 vs §4.4.6 |
| 8 | **Custo variável** | **R$9,50** vs **R$8,10** | §5.2 vs §5.4 |
| 9 | **Provisão de garantia** | **4% × R$150 = R$6** vs custo médio declarado **R$80** (→ R$3,20) | §4.4.3 e §10.3, na mesma linha |

**Impacto do #1:** o cliente lê 90 dias no app e 30 dias no contrato. Cláusula restritiva é nula (Art. 51 CDC) e a exposição real é **3x** a provisionada.
**Impacto do #2:** cliente vê 15%, prestador é cobrado 20-25%. Isso é disputa, chargeback e questionamento fiscal simultâneos.
**Impacto do #3 e #4:** quatro valores e dois relógios diferentes para a mesma cobrança. É Procon na certa.

## A.2 — Regras operacionais incompatíveis

| # | Regra | Contradição | Onde |
|---|---|---|---|
| 10 | **Tiers** | 3 (Bronze/Prata/Ouro) vs **4 (+ Diamante)** | §4.4.6 e schema `tier // 1,2,3` vs §4.2.2 e §14.3-D |
| 11 | **Janela de aceite** | **60 segundos** vs **15 minutos** vs **8 minutos** | §4.2.2 (60s e 15min na mesma tela) · §4.3.1 (8min) · §9.2 (KPI <8min) |
| 12 | **Score mínimo** | Matching aceita **≥60**, tier exige **>70** | §7.6 e §4.3.1 vs §4.4.6 |
| 13 | **Fotos obrigatórias** | **1 antes + 1 depois** vs **≥2** vs **≥1** | §4.4.2 vs §7-B.6 camada 2 vs camada 3 |
| 14 | **Foto em serviço ≤R$80** | Regra diz "para serviços >R$80" → luminária (R$80) e prateleira (R$70) **sem evidência obrigatória** | §4.4.2 |
| 15 | **Adicional abusivo** | **>100%** vs **>150%** | §4.4.5, §4.3.3, §4.5.2 vs §4.5.1 |
| 16 | **Escopo de lançamento** | "13 serviços no lançamento" (inegociável) vs 6 no beta | §2.2 vs §4.1 |
| 17 | **Cliente pode usar galeria** | Prestador é obrigado a câmera nativa; cliente sobe foto de estoque para forjar disputa | §4.2.1 vs §4.4.2 |

**Impacto do #11:** se a janela real é 60s, o KPI de "<8 min" é matematicamente impossível e o matching em ondas reatribui jobs já aceitos.
**Impacto do #12:** prestador estabilizado em 60-69 recebe jobs para sempre a 25% + D+15 e nunca sobe. Churn programado.
**Impacto do #14:** serviços baratos não geram evidência, mas a garantia exige evidência para ser válida. O cliente paga e não tem cobertura.

## A.3 — Contradições entre metas, gates e cronograma

| # | Item | Contradição | Onde |
|---|---|---|---|
| 18 | **Pedidos no mês 6** | Gate exige **600**; cronograma entrega **200**; projeção diz **600** | §11.1 vs §11 vs §5.3 |
| 19 | **Gate 1 "antifraude 100% funcional"** | Roadmap só liga Vision/TinEye **após 200 jobs**; Gate 1 roda com 80 | §11.1 vs §11.2 e §4.4.2 |
| 20 | **Comissão do mês 1** | Promessa de **0% por 30 dias**, mas projeção lança **R$615** (= 20,5%) | §6.1 vs §5.3 |
| 21 | **Garantia de demanda** | 20 prestadores × 8 jobs = **160 jobs/mês prometidos** vs **20 pedidos** projetados | §6.1 vs §5.3 |
| 22 | **Compensação de demanda** | Promessa é **mensal**; provisionamento é **R$2.000 uma vez** (devido: R$4.000/mês) | §6.1 |
| 23 | **Custo até soft launch** | **R$520K** vs burn acumulado **R$459.885** (Δ R$60.115) | §11 vs §5.3 |
| 24 | **Break-even** | Mês **24-30** / **24-26** / **24** / 4.200-4.500 pedidos | TL;DR vs §5.3 vs Anexo B |
| 25 | **Payback antes do break-even** | Payback M18-24 com break-even M24-30 é impossível | TL;DR |
| 26 | **Intervenção manual <30%** | Disputa sempre manual + adicional >100% manual + antecedentes leves manual + evidência fraca manual + matching manual até mês 6 + cold-start manual até mês 6 | §9.2 vs §4.5.2, §4.3.2, §11.2 |

## A.4 — Métricas com números que não fecham

| # | Métrica | O que está escrito | O que a conta dá |
|---|---|---|---|
| 27 | **LTV do pitch deck** | R$810 com 4,5 jobs | R$810 ÷ 4,5 = **R$180/job** — ticket que não existe em lugar nenhum (declarado R$150). E é **GMV, não margem**. §5.4 calcula R$132,30. **Divergência de 6,1x** |
| 28 | **LTV/CAC** | **>15x** no dashboard vs **2,75x** no unit economics | §9.2 vs §5.4 |
| 29 | **Receita bruta do beta** | R$7.000 para 80 jobs | R$87,50/job, mas ticket declarado é R$150 → deveria ser **R$12.000** |
| 30 | **Take rate mês 12** | 24% | R$93.000 ÷ R$300.000 = **31%** |
| 31 | **Base da antecipação** | R$150.000 de recebíveis | 20% do repasse real (R$238.500) = **R$47.700**. Base **3,1x** inflada |
| 32 | **Churn <40% em 90 dias** | Meta para categoria de urgência | Frequência natural é 1-2 jobs/**ano**. Churn de 90d será 75-85% **por natureza**, não por falha. Você vai reprovar um gate saudável |

---

# BLOCO B — BUGS LÓGICOS E DE MODELO DE DADOS (28)

Estes não são riscos futuros. São defeitos que impedem o produto de funcionar no pedido nº 1.

## B.1 — Bloqueadores absolutos

| # | Bug | Evidência | Consequência |
|---|---|---|---|
| 33 | **Prestador novo é invisível para o matching** | `score Int @default(0)` + `minScore: 60` (§7.6) | Os 15 prestadores fundadores — fator crítico nº 1 do PRD — **nunca recebem job**. Cold-start por construção |
| 34 | **Não existe lock no aceite** | `MatchOrderUseCase` sem lock, ondas + 60s + múltiplos candidatos | Dois prestadores aceitam o mesmo pedido. `last-write-wins` (§8.4) sobrescreve |
| 35 | **Telefone do cliente exposto na tela do job** | §4.2.2: *"Informações do cliente (nome, endereço, **telefone**)"* | Todo o regex do chat (§4.5.1, 13 padrões) é teatro. **Não há máscara/proxy em nenhum lugar do documento** |
| 36 | **Pix não tem fluxo definido** | §4.4.1 pré-autoriza **cartão**; Pix não tem pré-autorização. `PaymentStatus` não tem estado "aguardando Pix" | O método mais usado no Brasil não tem: momento de cobrança, split, estorno, expiração de QR |
| 37 | **Falha de captura não tratada** | §4.3.1 passo 34 captura **depois** da execução | Cartão sem limite/cancelado: prestador já trabalhou. Quem paga? Não definido. Quebra a confiança no job 1 |
| 38 | **CPF obrigatório no schema, ausente no cadastro** | `User.cpf String @unique` (não-null) vs §4.2.1 "telefone + nome + email" | Insert falha ou vai com dummy. E **não há KYC do cliente** — o lado que dá chargeback e entra na casa do prestador |

## B.2 — Modelo de dados incompleto ou inconsistente

| # | Problema | Evidência |
|---|---|---|
| 39 | `daily_job_limit Int` não-nullable com comentário `// null Tier3` | Schema Provider vs §4.4.6 "Ilimitado" |
| 40 | **Model `Address` não existe** | Referenciado em `User.addresses Address[]` e `Order.address_id`, nunca definido |
| 41 | **17 enums não declarados** | UserType, OrderStatus, Urgency, CancelledBy, EvidenceType, AdditionalStatus, DisputeSide, DisputeStatus, DisputeDecision, DocType, PaymentMethod, PaymentStatus, PayoutStatus, FraudType, Severity, NotificationType, NotificationStatus |
| 42 | **`Provider` não tem lat/lng** | §7.6 usa `haversine(p.location, ...)` — campo inexistente. PostGIS está no Docker, não no Prisma |
| 43 | **`Payment.order_id @unique`** (1:1) | §4.3.3 gera **segunda** pré-autorização para o adicional. Não cabe no modelo |
| 44 | **`Dispute.order_id @unique`** | Só 1 disputa por pedido. Garantia acionada após disputa resolvida não pode ser registrada |
| 45 | **`Review.order_id @unique`** | Reexecução com segundo prestador (§4.3.4) não pode ser avaliada |
| 46 | **`OrderEvidence` sem `provider_id`** | Em reexecução, evidências de dois prestadores se misturam. A prova da disputa fica contaminada |
| 47 | **`Payout.wallet_id` sem `@relation`** | Integridade referencial parcial em tabela de dinheiro |
| 48 | **`ProviderWallet` sem lock de concorrência** | Saldos atualizados por eventos assíncronos → race condition em dinheiro |

**Nota:** §7.5 afirma *"Schema Prisma completo (todos os models acima)"* e o Sprint 0A marca `[ ] Prisma schema completo`. **Não está completo e não compila.**

## B.3 — Segurança que não é estrutural (contradiz §7.1)

| # | Problema | Evidência |
|---|---|---|
| 49 | **CPF em texto puro no schema** | `User` tem `cpf String @unique` **e** `cpf_encrypted`. §7-B.4 diz "nunca em texto puro" |
| 50 | **AuditLog depende de disciplina manual** | §7-B.3: `if (result?.auditEntry)`. Se o dev esquecer, não há log. Contradiz *"Nenhum dev consegue atalhar a arquitetura mesmo que queira"* |
| 51 | **AuditLog não registra tentativas negadas** |Interceptor grava só após `next.handle()` bem-sucedido. As tentativas negadas são as mais importantes em fraude |
| 52 | **Hash de CPF com salt global** | `sha256(cpf + PII_SALT)`. Espaço de busca do CPF é pequeno → rainbow table trivial se o salt vazar. Deveria ser HMAC com chave em KMS |
| 53 | **Webhook sem idempotência** | §14.3-C trata HMAC como P0, mas nada sobre reentrega. Webhook duplicado = captura/repasse duplicado |
| 54 | **Sem teste de concorrência ou carga** | Manual §3: unit + Playwright Chromium + tsc. Nada de corrida no aceite, nada de carga |
| 55 | **Sem rollback de migration** | CI/CD e Prisma citados; rollback nunca |
| 56 | **Sem gateway secundário nem reserva de liquidez** | §7.3 só Pagar.me. §14.3-C menciona "Asaas" mas há um adapter só. Gateway congela saldo → 50 famílias sem receber |
| 57 | **`last-write-wins` em dado financeiro** | §8.4. Perde transições de estado — e a timeline é a prova da disputa |
| 58 | **`estimatedWaitMinutes` hardcoded** | §7.6: `urgent ? 60 : 120`. Promete 60min, entrega 6h |
| 59 | **Background location já implementado** | Manual M3 + §14.3-E (`ACCESS_BACKGROUND_LOCATION`). Vigilância contínua — ver Bloco E |
| 60 | **Contagem de módulos divergente** | §7.1 diz **6**, §7.2 lista **7**, §14.3-C diz **13** |

---

# BLOCO C — FUNCIONALIDADES AUSENTES (27)

Não estão pendentes. **Não existem no documento.**

## C.1 — Receita e conversão

| # | Lacuna | Por que dói |
|---|---|---|
| 61 | **Máscara de telefone / call proxy** | É o buraco nº 1 da desintermediação. Twilio está contratado só para SMS |
| 62 | **Escopo contratado assinado antes do início** | Fotos provam **execução**, não **escopo**. É essa peça que ganha disputa e chargeback |
| 63 | **Reagendamento** | Só existe `cancel`. Reagendar é o que salva a receita |
| 64 | **Preço por distância** | Raio expande 5→8→12km, preço não muda. Prestador a 12km recusa → cold-start |
| 65 | **Waitlist com posição e previsão calculada** | §4.3.2 diz "fila de espera"; não há fila, posição nem ETA real |
| 66 | **Sinal / depósito** | Não existe. E a retenção atual (§4.2.1) **vai para o prestador** — devolve a ele o dinheiro que bloquearia o conluio |
| 67 | **Pesquisa "ele te ofereceu fazer por fora?"** | Único sensor direto de desintermediação. Não existe |
| 68 | **Programa de fidelidade** | §8.1 promete "desde Mês 1" como mitigação de LTV baixo. Não existe em §4.2 |

## C.2 — Operação e prova

| # | Lacuna | Por que dói |
|---|---|---|
| 69 | **Gravação de chamada do operador** | §4.3.4 e §10.2 mandam ligar para as partes. Sem gravação + AuditLog, a decisão vira palavra contra palavra — exatamente o problema que você promete resolver |
| 70 | **Ouvidoria / reclamação fora de disputa** | Cliente insatisfeito sem canal → Reclame Aqui / Procon |
| 71 | **NPS de prestador** | §9.2 só tem NPS de cliente. Você não mede o lado escasso |
| 72 | **Gestão de materiais além dos R$30** | Sem OCR de nota, sem fornecedor, sem estoque. Os R$30 sem aprovação são vetor de fraude |
| 73 | **Sazonalidade / surge / escassez** | Verão = ventilador. Chuva = infiltração. Nada previsto |
| 74 | **Validação de complemento de endereço** | Geocoding não valida apto/bloco. Prestador chega no prédio errado |
| 75 | **Trilha de acesso a dado sensível** | Quem viu o CPF, quando, por quê. §7-B.8 não cobre |

## C.3 — B2B (adiado para mês 24+, mas é onde a conta fecha)

| # | Lacuna |
|---|---|
| 76 | **NFS-e real** — só "recibo fiscal" com `window.print()`. Recibo não é nota |
| 77 | **Definição de tomador do serviço e fluxo fiscal** — plataforma é tomadora ou mandatária? |
| 78 | **Multi-imóvel por conta** |
| 79 | **Alçada de aprovação por síndico/gerente** |
| 80 | **Faturamento consolidado mensal** |
| 81 | **SLA contratual com penalidade** |
| 82 | **API pública + webhooks para administradoras** |
| 83 | **Contrato de intermediação/mandato** — só existe "contrato de parceria" |

---

# BLOCO D — LACUNAS FINANCEIRAS (12)

## D.1 — Custos que simplesmente não estão na conta

| # | Item omitido | Valor estimado/pedido |
|---|---|---|
| 84 | Provisão de garantia com **90 dias** (código), não 30 | R$ 6,40 |
| 85 | Provisão de chargeback (§8.3 reconhece que não provisiona) | R$ 2,60 |
| 86 | Créditos de no-show/cancelamento (§5.3 reconhece) | R$ 1,50 |
| 87 | Suporte humano por job (30% × 15min × R$31/h) | R$ 2,33 |
| 88 | **Tributos sobre a receita da plataforma** | R$ 3,75 |
| 89 | Máscara de telefone (se implementada) | R$ 1,50 |
| 90 | Seguro de acidentes pessoais do prestador | R$ 0,63 |

**Resultado:** custo variável real ≈ **R$26**, não R$8,10. Margem de contribuição ≈ **R$11**, não R$29,40. Contribuição líquida após CAC ≈ **R$0,68**, não R$19,80.

| # | Lacuna | Evidência |
|---|---|---|
| 91 | **Dupla contagem de KYC** | R$45/prestador está no CAC (§5.2) **e** R$1,50/pedido no custo variável. R$3.000/mês contados duas vezes |
| 92 | **Receita fantasma de antecipação** | R$3.750/mês projetados, mas o spread é do Pagar.me. Sem contrato de revenue share, a receita é **zero** |
| 93 | **Receita juridicamente proibida** | "Seguro estendido R$9,90" = R$1.980/mês no §5.1 **e no Slide 6 do pitch**. §10 proíbe cobrança de prêmio sob pena de autuação SUSEP de R$500K+ |

## D.2 — Modelos que não existem

| # | Lacuna | Consequência |
|---|---|---|
| 94 | **Capacidade de oferta** | 2.000 pedidos ÷ 50 prestadores = **40 jobs/prestador/mês** (2/dia útil com deslocamento em SP). Nunca modelado. Break-even real exige **~340 prestadores**, não 50 |
| 95 | **Custo de reposição por churn** | Churn de prestador 20%/mês (§9.2) × CAC R$220 = **R$14,7K/mês** não provisionados. Com NR-10 o CAC vai a ~R$800 → R$54K/mês |

**Break-even recalculado:**

| Cenário | Pedidos/mês |
|---|---|
| Declarado no PRD | 4.200-4.500 |
| Com contribuição otimista do próprio PRD (R$19,80) | **8.737** |
| Com contribuição real (~R$11) | **15.727** |

---

# BLOCO E — LACUNAS JURÍDICAS E DE SEGURANÇA FÍSICA (13)

## E.1 — Riscos de extinção que não estão em nenhuma matriz

| # | Lacuna | Dimensão |
|---|---|---|
| 96 | **NR-10 ausente** | "Troca de disjuntor R$90 / 30min" está no catálogo (§4.1) sem exigência de capacitação, EPI ou desenergização. NR-10 básico (40h) custa R$300-600/prestador e **não está no CAC** |
| 97 | **Limite de escopo elétrico** | Quadro geral, padrão de entrada, trifásico = risco letal. Nada exclui esses serviços |
| 98 | **Protocolo de acidente com vítima** | Choque, queda, incêndio. Zero linhas no documento |
| 99 | **Seguro de acidentes pessoais do prestador** | §12.5 prevê RC Profissional (R$3-5K/ano) — que **não cobre** o prestador se machucando |
| 100 | **Análise de cobertura real da apólice** | RC Geral tipicamente **exclui erro de execução**. Incêndio por instalação malfeita provavelmente não está coberto, ou está em sub-limite com franquia de R$2-5K |
| 101 | **Cliente vulnerável / menor sozinho em casa** | Nenhum protocolo |
| 102 | **"Botão de emergência" sem definição** | Aparece em §4.2.1 e §4.2.2. O que ele faz? Para quem liga? Em quanto tempo? Não definido |

> **Um acidente fatal no pedido 30 encerra a FACILITA.** Não é cauda longa — é risco de extinção, e não está na matriz de §8.

## E.2 — Vínculo trabalhista: o produto é o dossiê da acusação

§8.5 classifica como "Média/Alto" e mitiga com *"sem exclusividade, sem controle de horário"*. Mas o desenho funcional acumula **todos os elementos de subordinação**:

| # | Elemento no produto | Onde | Efeito jurídico |
|---|---|---|---|
| 103 | Score penaliza recusa (15% do peso) | §4.4.6 | Poder diretivo indireto |
| 104 | Limite diário de jobs imposto | §4.4.6 + schema | Controle de produção |
| 105 | Suspensão 7 dias por cancelamento/no-show | §4.4.4, §4.3.2 | Poder disciplinar |
| 106 | Alarme contínuo até aceitar + overlay 60s | §4.2.2 | Pressão de disponibilidade |
| 107 | **Geolocalização em background (já implementada)** | Manual M3, §14.3-E | Vigilância continuada |
| 108 | MEI obrigatório como condição de entrada | §6.1 | Indício de pejotização (Art. 9º CLT) |
| 109 | Uniforme/kit fornecido | §6.1 | Subordinação visual |

Isoladamente cada item é defensável. **Empilhados, são um prontuário de vínculo.** Nenhum trabalhista aprova esse conjunto sem ajuste — e este risco é **mais grave que a SUSEP**, que o PRD trata com muito mais cuidado.

## E.3 — CDC e LGPD

| # | Lacuna | Evidência |
|---|---|---|
| 110 | **Prazo de acionamento de 24h é cláusula abusiva** | §10.1: "até 24h após identificar problema". CDC Art. 26 §2º dá **90 dias** da constatação do vício oculto. Cláusula nula — e contamina o contrato inteiro em juízo |
| 111 | **Art. 49 CDC (arrependimento de 7 dias) ausente** | Contratação fora do estabelecimento. Nenhuma posição jurídica |
| 112 | **LGPD: dado criminal + decisão automatizada + RIPD** | §7-B.8 trata biometria com consentimento. Mas: dado de infração penal tem base legal restrita (Art. 11, II, "g"); bloqueio automático gera direito a revisão (Art. 20); biometria + criminal + geolocation em background exige **RIPD**. Nada disso existe |

---

# BLOCO F — O ANTIFRAUDE VAI GERAR MAIS FALSO POSITIVO QUE FRAUDE

Duas regras de §4.5.1 foram calibradas para uma categoria de **alta frequência** (delivery) e aplicadas a uma de **baixa frequência**:

- *"Cliente nunca mais voltou após job → flag de desintermediação"*
- *"Prestador com recorrência <10% → investigação de conluio"*

Serviço de urgência residencial tem frequência natural de **1-2 jobs/ano por cliente**. Essas regras vão sinalizar **~80% da base honesta**. Seus 2 operadores vão investigar inocentes enquanto a fraude real — o telefone entregue na tela do job — passa livre.

**Correção:** condicionar as regras à frequência esperada da categoria, não a threshold absoluto.

---

# ORDEM DE CORREÇÃO

## Onda 0 — Coerência documental (2-3 dias, custo zero, só decisão)
Itens **1 a 32**. Uma tabela canônica única e versionada para: garantia, comissão, taxa de deslocamento, gatilho de cancelamento, tiers, janela de aceite, threshold de adicional, mínimo de fotos. Deletar "seguro estendido" da projeção **e do pitch deck**. Corrigir LTV para margem. Alinhar Gate 2 com o cronograma.

## Onda 1 — Bugs que impedem funcionar (3-5 dias)
Itens **33 a 42**. Score provisório para prestador novo. Lock de aceite com verificação de linhas afetadas. Máscara de telefone. Fluxo completo de Pix e de falha de captura. Completar schema (Address, enums, lat/lng, nullables).

## Onda 2 — Risco de extinção (1-2 semanas)
Itens **96 a 112**. NR-10 + EPI + limite de escopo + protocolo de acidente + seguro de acidentes pessoais. **Parecer trabalhista sobre o conjunto — antes do parecer SUSEP.** RIPD + base legal para dado criminal + revisão de decisão automatizada. Parecer fiscal: tomador, NFS-e, tributação sobre comissão vs GMV.

## Onda 3 — Economia (antes de captar)
Itens **84 a 95**. Refazer o modelo com a tabela de custos real. Modelar capacidade de oferta e reposição por churn. Reavaliar o ask — que provavelmente não é R$1,5M para B2C em 5 bairros.

## Onda 4 — Só depois: P0 técnicos do §14
Chaves de produção, VPS, alarme, trava de câmera, Play Store. **Não adianta colocar no ar um sistema cujas regras de negócio se contradizem.**

---

# VEREDITO

**A engenharia é real e vale.** Hexagonal, testes verdes, criptografia, audit log, CI maduro, 88% implementado. Isso não é comum em pré-seed.

**O documento não é confiável.** 32 contradições de regra de negócio significam que dois devs lendo o mesmo PRD implementam coisas diferentes — e já implementaram: garantia de 90d no código, 30d no contrato; comissão de 15% no recibo, 25% no tier.

**O modelo não fecha.** Contribuição líquida de R$0,68/pedido, break-even em 15,7 mil pedidos/mês contra 4,2 mil declarados, oferta subdimensionada em 7x, e um prestador que ganha R$23/hora quando o mercado paga R$72.

**Há dois riscos de extinção não mapeados:** acidente elétrico sem NR-10, e ação trabalhista cujo dossiê o próprio produto constrói.

Nada disso é fatal ao projeto. É fatal ao **plano atual**. As Ondas 0 e 1 custam dias, não meses — e sem elas, os R$1,5M comprariam apenas a demonstração empírica de uma conta que já dá para fazer no papel.