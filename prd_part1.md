# PRD DEFINITIVO — FACILITA
**Product Requirements Document | Versão 2.0 — Revisada e Executável**
Última atualização: 2025
Autor: Product Strategy
Status: READY FOR EXECUTION
Confidencialidade: Internal Only

> **Nota desta versão:** Esta é a versão 2.0 do PRD, com 7 erros críticos corrigidos em relação à versão original: stack mobile revisado (React Native/Expo para o app do prestador), gateway de pagamento corrigido para Pagar.me, data model completo com todas as entidades, timeline integrada e sem contradições, projeção financeira com salários de mercado, cold-start do matching tratado, e risco regulatório da garantia documentado.

---

## 🎯 RESUMO EXECUTIVO (TL;DR)

**O que é:** Plataforma transacional de serviços domésticos de urgência e manutenção residencial (elétrica, hidráulica, reparos), com foco em qualidade, evidência operacional e fluxo fechado.

**O que NÃO é:** Marketplace genérico de reformas, plataforma de leads, GetNinjas vertical.

**Diferencial defensável:** Catálogo padronizado + Evidência obrigatória + Pagamento protegido + Garantia real + Antifraude desde o dia 1.

**Tese:** O mercado está educado (GetNinjas fez isso), mas frustrado com qualidade. Há espaço para quem trocar "volume de leads" por "confiança transacional".

**Capital necessário:** R$ 1,5M para 12 meses (revisado — ver seção 5.3)
**Payback esperado:** Mês 18-24
**Break-even:** Mês 24-30 (se executado com disciplina)

---

## 1. CONTEXTO ESTRATÉGICO

### 1.1 Problema Real

**Cliente**
- Contrata por indicação informal (WhatsApp, vizinho, porteiro)
- Não sabe preço justo
- Não tem garantia
- Sofre com "adicional surpresa"
- Não tem como reclamar (é a palavra dele vs. a do profissional)

**Prestador Bom**
- Demanda irregular
- Inadimplência (5-15% dos jobs)
- Desperdício de deslocamento (30% das visitas não convertem)
- Concorrência com profissional ruim (cliente não sabe diferenciar)
- Plataformas cobram lead ruim (GetNinjas) ou comissão predatória (40%+)

**Mercado**
- Serviços domésticos: R$ 80Bi/ano no Brasil
- <5% digitalizado
- Informalidade: 78%
- Fricção: altíssima em todas as pontas

### 1.2 Por Que Agora?

- **Mercado educado:** GetNinjas tem 12 anos, todo mundo já sabe que "existe app pra contratar profissional"
- **Frustração alta:** NPS do GetNinjas ~20-30 (público), Triider ~40-50
- **Infraestrutura disponível:** KYC automatizado, pagamento com split, antifraude, geolocalização — tudo barato e acessível
- **Comportamento mudou:** Pós-pandemia, cliente aceita pagar 15-20% mais caro por confiança

### 1.3 Por Que Não Funciona Hoje?

| Problema | GetNinjas | Triider | Habitissimo |
|---|---|---|---|
| Controle de qualidade | ❌ Zero | 🟡 Fraco | ❌ Zero |
| Garantia real | ❌ Não tem | 🟡 Vaga | ❌ Não tem |
| Fluxo fechado | ❌ Vazamento total | 🟡 ~40% vazam | ❌ Só vitrine |
| Padronização | ❌ Caos | 🟡 Parcial | ❌ Projetos únicos |
| Antifraude | ❌ Básico | 🟡 Médio | ❌ Básico |
| Densidade operacional | ✅ Alta | ❌ Baixa | 🟡 Média |

**Nossa tese:** Pegar densidade do GetNinjas + disciplina operacional (que ninguém tem) + modelo transacional de verdade.

---

## 2. VISÃO DO PRODUTO

### 2.1 Posicionamento

> "A forma mais confiável de resolver problemas elétricos e hidráulicos em casa."

**NÃO é:**
- ❌ "Marketplace de serviços"
- ❌ "Conectamos você a profissionais"
- ❌ "Contrate qualquer coisa"

**É:**
- ✅ "Chuveiro queimou? Resolvemos hoje com preço certo e garantia"
- ✅ "Problema elétrico em casa? Profissional verificado em até 2h"

### 2.2 Princípios de Produto (Inegociáveis)

1. **Tudo no app:** Contratação, comunicação, aprovação, pagamento, disputa — TUDO.
2. **Catálogo fechado:** 13 serviços no lançamento. Nada fora disso.
3. **Evidência obrigatória:** Sem foto antes/depois com qualidade mínima, não libera pagamento.
4. **Score > Estrelas:** Reputação baseada em dados (pontualidade, reabertura, evidência), não só avaliação.
5. **Antifraude é core:** Não é "feature do financeiro", é produto — ativo antes de qualquer usuário externo.
6. **Bons prestadores > Volume:** Preferir 20 excelentes a 200 medianos.
7. **Estética é Confiança:** Design premium, fluido e com autoridade técnica. Não é cosmético, é conversão.
8. **Comissão justa:** 18-25% é o máximo viável sem destruir oferta.
9. **Manual antes de automático:** Matching, KYC e validação de evidência são manuais nos primeiros 100 jobs, automatizados depois.
10. **Escalabilidade Geoespacial:** Uso obrigatório de PostGIS + Redis Geo para garantir precisão e velocidade no matching real-time.
11. **SLA de Suporte Multi-Nível:** Atendimento estruturado em N1 (Auto), N2 (Ops) e N3 (Especialista) para garantir confiança.
12. **Integridade de Evidência:** Uso exclusivo de câmera nativa no app do prestador para evitar fraudes com fotos da galeria.

### 2.3 Escopo do Lançamento

**Dentro**
- ✅ 13 serviços padronizados (ver seção 4.1) — apenas Elétrica nas primeiras 4 semanas de beta
- ✅ 5 bairros de classe A/B em São Paulo (Brooklin, Moema, Vila Mariana, Itaim Bibi, Campo Belo)
- ✅ Pagamento apenas cartão e Pix
- ✅ Garantia de 30 dias (escopo restrito, ver seção 10)
- ✅ Suporte humano forte (chat + telefone)

**Fora**
- ❌ Reformas completas
- ❌ Serviços comerciais/industriais
- ❌ Parcelamento (MVP é à vista)
- ❌ B2B/síndicos (futuro, não MVP)
- ❌ Outras cidades que não SP
- ❌ Serviços fora do catálogo (nem como "consulta")

### 2.4 Usuários e Personas

**Persona 1 — Cliente residencial com urgência**
Pessoa que teve problema com chuveiro, tomada, curto leve ou disjuntor e quer solução rápida, previsível e segura, sem depender de indicação improvisada ou múltiplos orçamentos confusos.

**Persona 2 — Cliente residencial organizado**
Pessoa que quer instalar luminárias, ventilador de teto, revisar pontos elétricos ou fazer pequenos upgrades, valorizando agendamento, preço claro e histórico do serviço.

**Persona 3 — Profissional autônomo bom**
Profissional competente, com experiência prática, que quer demanda recorrente e pagamento previsível, mas rejeita plataforma com comissão muito alta, fluxo bagunçado ou cliente mal qualificado. **Requisito mínimo: MEI ativo** (ou abertura de MEI orientada no onboarding).

**Persona 4 — Prestador oportunista**
Profissional que aceita qualquer job, tenta cobrar adicional fora de fluxo, busca fechar por fora do app e gera risco reputacional. O produto precisa ser desenhado para identificar e desincentivar esse perfil rapidamente.

---

## 3. ANÁLISE COMPETITIVA

### 3.1 GetNinjas (Principal Concorrente)
- **Modelo:** Marketplace de leads
- **Receita:** R$ 5-25 por lead (prestador paga)
- **Força:** SEO dominante, marca conhecida, 500+ categorias
- **Fraqueza:** Zero controle de qualidade, desintermediação imediata, leads ruins
- **Nossa vantagem:** Qualidade >> Quantidade
- **Nossa desvantagem:** Eles têm 12 anos de SEO e marca
- **Estratégia:** Não competir em volume. Competir em "serviço fechado com garantia".

### 3.2 Triider (Concorrente Modelo Parecido)
- **Modelo:** Transacional (15-25% comissão)
- **Força:** Catálogo estruturado, verificação de prestadores
- **Fraqueza:** Baixa densidade (fora SP/RJ não funciona), marketing fraco, 40% de abandono
- **Nossa vantagem:** Execução melhor do mesmo modelo
- **Nossa desvantagem:** Eles têm ~5 anos de operação
- **Estratégia:** Superar em antifraude, suporte e experiência do prestador.

### 3.3 Síntese Competitiva

| Métrica | GetNinjas | Triider | FACILITA |
|---|---|---|---|
| Controle de qualidade | 2/10 | 6/10 | 8/10 |
| Experiência do cliente | 7/10 | 7/10 | 8/10 |
| Experiência do prestador | 4/10 | 6/10 | 8/10 |
| Densidade (SP) | 9/10 | 5/10 | 3/10 → 7/10 (mês 12) |
| Antifraude | 3/10 | 5/10 | 8/10 |
| Garantia real | 0/10 | 3/10 | 7/10 |

**Nosso moat:** Confiança operacional (evidência + garantia + qualidade) em mercado educado mas frustrado.

---

## 4. ESPECIFICAÇÃO FUNCIONAL

### 4.1 Catálogo de Serviços

**Categoria: Elétrica (6 serviços) — Lança no Beta Fechado**

| Serviço | Descrição | Preço Fixo | Tempo Médio | Inclusos | NÃO Inclusos |
|---|---|---|---|---|---|
| Instalação de chuveiro | Troca/instalação de chuveiro elétrico | R$ 120 | 1h | Mão de obra, teste | Chuveiro, fiação nova, disjuntor |
| Troca de torneira elétrica | Substituição de torneira elétrica | R$ 100 | 45min | Mão de obra, vedação básica | Torneira, fiação |
| Instalação de ventilador de teto | Montagem e instalação de ventilador | R$ 150 | 1h30 | Mão de obra, fixação | Ventilador, suporte reforçado |
| Troca de disjuntor | Substituição de disjuntor no quadro | R$ 90 | 30min | Mão de obra, teste | Disjuntor |
| Instalação de lustre/luminária | Até 3 pontos de luz | R$ 80 | 45min | Mão de obra | Lustre, lâmpadas |
| Tomada/interruptor (até 3 pontos) | Instalação ou troca | R$ 110 | 1h | Mão de obra, teste | Tomadas, interruptores, caixa de passagem |

**Categoria: Hidráulica (4 serviços) — Lança no Soft Launch (Mês 6)**

| Serviço | Descrição | Preço Fixo | Tempo Médio | Inclusos | NÃO Inclusos |
|---|---|---|---|---|---|
| Troca de torneira | Substituição de torneira simples | R$ 80 | 30min | Mão de obra, vedação | Torneira |
| Troca de registro | Substituição de registro (gaveta/pressão) | R$ 100 | 1h | Mão de obra, vedação | Registro |
| Reparo de válvula de descarga | Conserto ou troca de válvula | R$ 90 | 45min | Mão de obra, reparo básico | Válvula nova (se necessário) |
| Desentupimento simples | Pia, ralo ou vaso (sem quebra) | R$ 120 | 1h | Mão de obra, equipamento básico | Quebra de piso, sonda elétrica |

**Categoria: Pequenos Reparos (3 serviços) — Lança no Soft Launch (Mês 6)**

| Serviço | Descrição | Preço Fixo | Tempo Médio | Inclusos | NÃO Inclusos |
|---|---|---|---|---|---|
| Montagem de móvel pequeno | Até 1,5m (rack, estante simples) | R$ 100 | 1h30 | Mão de obra, ferramentas | Peças faltantes |
| Instalação de suporte de TV | Até 55", parede comum | R$ 130 | 1h | Mão de obra, buchas/parafusos básicos | Suporte, parede de gesso sem reforço |
| Fixação de prateleira/quadro (até 3 peças) | Furação e fixação | R$ 70 | 30min | Mão de obra, buchas/parafusos | Prateleira, parede estrutural |

**Total lançamento:** 6 serviços (Beta) → 13 serviços (Soft Launch, Mês 6)
**Ticket médio estimado:** R$ 105 | **Adicionais médios:** +R$ 45 (30% dos jobs têm adicional de material)

**Material Básico Incluso (regra para Adicionais Menores):**
O prestador pode usar até R$ 30 em materiais básicos de consumo (fita isolante, vedação, buchas) sem aprovação explícita do cliente, com foto obrigatória da nota fiscal. Valores acima desse limite seguem o fluxo normal de adicional. Isso evita fricção em cobranças menores e reduz artificialmente a taxa de adicionais.

### 4.2 Arquitetura de Informação

#### 4.2.1 App do Cliente (Next.js 15 PWA)

```
├── Onboarding
│   ├── Cadastro (telefone + nome + email)
│   ├── Verificação OTP
│   └── Endereço principal
│
├── Home
│   ├── Busca de serviço
│   ├── Categorias (Elétrica, Hidráulica, Reparos)
│   └── Pedidos recentes
│
├── Novo Pedido
│   ├── Seleção de serviço (catálogo)
│   ├── Triagem guiada (perguntas dinâmicas)
│   ├── Upload de fotos (mínimo 2, câmera ou galeria)
│   ├── Urgência (Normal: 24h | Urgente: 4h +R$ 25)
│   ├── Disponibilidade
│   └── Confirmação de preço
│
├── Match
│   ├── Profissional recomendado (1 opção principal)
│   │   ├── Foto, nome, nota, jobs concluídos
│   │   ├── Tempo estimado de chegada
│   │   └── Especialidades
│   └── [Aceitar] ou [Ver outro profissional] (max 3 opções)
│
├── Acompanhamento
│   ├── Timeline em tempo real
│   │   ├── Aceito
│   │   ├── A caminho
│   │   ├── Chegou
│   │   ├── Em execução
│   │   ├── Aguardando aprovação de adicional
│   │   └── Concluído
│   ├── Chat com prestador (Stream.io)
│   └── Botão de emergência (suporte direto)
│
├── Aprovação de Adicional
│   ├── Descrição do profissional
│   ├── Fotos da situação
│   ├── Valor adicional
│   └── [Aprovar] [Recusar] [Falar com Suporte]
│
├── Conclusão
│   ├── Fotos antes/depois
│   ├── Checklist de itens executados
│   ├── Valor final
│   └── [Aprovar serviço] [Contestar]
│
├── Pagamento
│   ├── Resumo (serviço base + adicionais)
│   ├── Método (Cartão | Pix — via Pagar.me)
│   └── Comprovante
│
├── Avaliação
│   ├── Nota geral (1-5 estrelas)
│   ├── Critérios (Pontualidade, Qualidade, Limpeza, Cordialidade)
│   └── Comentário (opcional)
│
├── Garantia
│   ├── Pedidos com garantia ativa
│   ├── Acionar garantia
│   │   ├── Descrição do problema
│   │   ├── Fotos
│   │   └── Enviar para análise
│   └── Status da solicitação
│
└── Perfil
    ├── Dados pessoais
    ├── Endereços salvos
    ├── Métodos de pagamento
    ├── Histórico de pedidos
    └── Créditos/cupons
```

#### 4.2.2 App do Prestador (React Native + Expo — iOS e Android nativos)

> **Decisão técnica:** O app do prestador é React Native/Expo (não PWA) por razões operacionais críticas: push notifications confiáveis no iOS para aceite em 15 minutos, geolocalização em background para a timeline, câmera nativa de alta qualidade para evidências e funcionamento offline parcial. O app do cliente pode ser PWA, mas o do prestador não pode.

```
├── Onboarding
│   ├── Cadastro básico (CPF/CNPJ, telefone, email)
│   ├── Verificação de MEI (obrigatório — orientação de abertura se necessário)
│   ├── Documentos (RG/CNH, selfie, comprovante residência)
│   ├── Categorias de atuação
│   ├── Região de atendimento (raio em km)
│   ├── Conta bancária (validada via Pagar.me)
│   └── Background check (aguardar aprovação 3-7 dias)
│
├── Ativação e Evolução
│   ├── Validação de Experiência (Análise de Portfolio)
│   ├── Documentação KYC Completa
│   └── Onboarding de Boas Práticas (vídeo + quiz técnico)
│
├── Home
│   ├── Status (Disponível | Indisponível | Em atendimento)
│   ├── Nível de Parceiro (Bronze | Prata | Ouro)
│   ├── Progresso para Próximo Tier (Jobs restantes)
│   ├── Saldo disponível
│   ├── Próximos agendamentos
│   └── Notificações (push nativo)
│
├── Fila de Oportunidades
│   ├── Card de job
│   │   ├── Categoria
│   │   ├── Distância
│   │   ├── Valor (base)
│   │   ├── Urgência
│   │   ├── Fotos do problema
│   │   ├── Descrição do cliente
│   │   └── Janela de disponibilidade
│   ├── [Aceitar] (15 min para responder)
│   └── [Recusar] → campo obrigatório de motivo (dropdown)
│       ├── Agenda cheia
│       ├── Problema de saúde
│       ├── Fora do meu raio
│       ├── Equipamento indisponível
│       └── Outro (campo aberto)
│
├── Job Ativo
│   ├── Timeline operacional (com suporte offline — sincroniza quando conectar)
│   │   ├── [Saí para atendimento]
│   │   ├── [Cheguei no local]
│   │   ├── [Iniciei execução]
│   │   ├── [Pausar] (com justificativa)
│   │   └── [Concluir]
│   ├── Informações do cliente (nome, endereço, telefone)
│   ├── Chat (Stream.io)
│   ├── Navegação integrada (abre Waze/Google Maps)
│   └── Botão de emergência
│
├── Solicitar Adicional
│   ├── Motivo (dropdown)
│   │   ├── Material extra necessário
│   │   ├── Escopo maior que previsto
│   │   ├── Problema adicional identificado
│   │   └── Outro
│   ├── Descrição detalhada
│   ├── Fotos obrigatórias (min 2 — câmera nativa, sem galeria)
│   ├── Valor solicitado
│   └── [Enviar para aprovação]
│
├── Conclusão
│   ├── Foto ANTES (obrigatória — câmera nativa)
│   ├── Foto DEPOIS (obrigatória — câmera nativa)
│   ├── Checklist de itens executados
│   ├── Observações
│   └── [Finalizar serviço]
│
├── Carteira (Pagar.me)
│   ├── Saldo disponível
│   ├── Próximos repasses (com data)
│   ├── Histórico de recebimentos
│   ├── [Solicitar antecipação] (se Tier 2 ou 3)
│   └── Extrato detalhado
│
├── Desempenho
│   ├── Score geral (0-100)
│   ├── Breakdown com janela rolante de 90 dias:
│   │   ├── Taxa de aceitação (meta: >70%)
│   │   ├── Pontualidade (meta: >90%)
│   │   ├── Taxa de conclusão (meta: >95%)
│   │   ├── Qualidade de evidência (meta: >8/10)
│   │   ├── Avaliação do cliente (meta: >4.5)
│   │   └── Taxa de reabertura (meta: <3%)
│   ├── Tier atual (Bronze, Prata, Ouro)
│   └── Benefícios do próximo tier
│
└── Perfil
    ├── Dados pessoais
    ├── Documentos e situação MEI
    ├── Categorias habilitadas
    ├── Disponibilidade (agenda semanal)
    ├── Região de atendimento
    └── Preferências de notificação
```

#### 4.2.3 Backoffice (Operação) — Next.js + TypeScript

```
├── Dashboard
│   ├── Métricas do dia (pedidos, receita, disputas)
│   ├── Fila de ação (triagens pendentes, disputas, aprovações)
│   └── Alertas (fraude, SLA estourado, prestador no-show)
│
├── Gestão de Pedidos
│   ├── Listagem (filtros: status, região, categoria, risco)
│   ├── Matching manual (semanas 1-8 de operação)
│   ├── Detalhes do pedido
│   │   ├── Timeline completa
│   │   ├── Histórico de chat
│   │   ├── Evidências (fotos com metadata)
│   │   ├── Adicionais
│   │   └── Financeiro
│   └── Ações manuais
│       ├── Forçar cancelamento
│       ├── Reatribuir prestador (fluxo de cancelamento tardio)
│       ├── Liberar pagamento manual
│       └── Aplicar crédito/estorno
│
├── Fila de Reatribuição (cancelamento tardio de prestador)
│   ├── Prestador cancelou em <4h → busca automática de substituto
│   ├── Se não encontrar substituto em 30min → operador liga para cliente
│   └── Decisão: reagendamento + crédito R$ 30, ou cancelamento sem taxa
│
├── Triagem Manual
│   ├── Pedidos fora de padrão
│   ├── Evidências insuficientes (revisão 100% nos primeiros 200 jobs)
│   └── [Aprovar] [Recusar] [Solicitar mais informações]
│
├── Gestão de Disputas
│   ├── Fila (ordenada por SLA)
│   ├── Detalhes
│   │   ├── Versão do cliente
│   │   ├── Versão do prestador
│   │   ├── Evidências de ambos
│   │   ├── Histórico do prestador (outras disputas)
│   │   ├── Score de risco
│   │   └── Recomendação automática
│   └── Decisão
│       ├── A favor do cliente (estorno)
│       ├── A favor do prestador (libera pagamento)
│       ├── Meio a meio (repasse parcial — via Pagar.me)
│       └── Reexecução (novo prestador sem custo ao cliente)
│
├── Gestão de Prestadores
│   ├── Listagem (filtros: score, tier, região, categoria, MEI)
│   ├── Aprovações pendentes
│   ├── Detalhes do prestador
│   │   ├── Dados cadastrais e situação MEI
│   │   ├── Documentos
│   │   ├── Background check
│   │   ├── Histórico de jobs
│   │   ├── Métricas de desempenho (janela 90 dias)
│   │   ├── Disputas
│   │   └── Flags de risco
│   └── Ações
│       ├── Aprovar/reprovar
│       ├── Suspender temporariamente
│       ├── Banir permanentemente
│       ├── Alterar tier manualmente
│       └── Enviar mensagem
│
├── Antifraude
│   ├── Dashboard de sinais
│   ├── Regras (on/off por flag)
│   ├── Whitelist/Blacklist
│   └── Investigações ativas
│
├── Financeiro (Pagar.me Dashboard integrado)
│   ├── Receita (diária, semanal, mensal)
│   ├── Comissão por tier
│   ├── Repasses agendados
│   ├── Retenções (disputas, chargeback)
│   └── Conciliação bancária
│
└── Analytics
    ├── Funil de conversão
    ├── CAC por canal
    ├── LTV por coorte
    ├── Churn (cliente e prestador)
    ├── NPS
    └── Métricas operacionais (tempo de resposta, SLA)
```

### 4.3 Fluxos Críticos

#### 4.3.1 Fluxo: Pedido Padrão (Happy Path)

```
CLIENTE                          SISTEMA                         PRESTADOR

1. Abre app
2. Seleciona "Chuveiro queimou"
3. Responde triagem:
   - Tipo de chuveiro: Elétrico
   - Tem o chuveiro novo: Sim
   - Urgência: Normal
4. Upload 2 fotos (câmera ou galeria)
5. Disponibilidade: Amanhã manhã
                                 6. Valida endereço
                                 7. Calcula preço: R$ 120
                                 8. Match com prestador
                                    (manual nas semanas 1-8;
                                     automático a partir do job 100)
                                    - Score >60
                                    - Raio <5km
                                    - Disponibilidade compatível
                                 9. Oferece job (push nativo iOS/Android)
                                                                  10. Recebe notificação
                                                                  11. Visualiza job
                                                                  12. [Aceita] (8 min depois)
                                 13. Cria agendamento
                                 14. Notifica cliente
15. Recebe confirmação
    "João vai amanhã às 9h"
16. Autoriza pagamento (R$ 120)
                                 17. Pré-autoriza cartão (Pagar.me)
                                 18. D-Day: Notifica ambos

[DIA DO SERVIÇO]
                                                                  19. [Saí para atendimento] 8:30
20. Recebe: "João saiu"
                                                                  21. [Cheguei] 9:05
22. Recebe: "João chegou"
                                                                  23. [Iniciei execução] 9:10
                                                                  (registros offline se sem sinal,
                                                                   sincroniza ao recuperar conexão)
                                                                  24. Executa serviço
                                                                  25. Tira foto ANTES (câmera nativa)
                                                                  26. Tira foto DEPOIS (câmera nativa)
                                                                  27. Preenche checklist:
                                                                      ✓ Chuveiro instalado
                                                                      ✓ Testado funcionamento
                                                                      ✓ Vedação conferida
                                                                  28. [Concluir serviço] 10:15
                                 29. Valida evidências automaticamente
                                     (nos primeiros 200 jobs: backoffice
                                      revisa 100% em até 30 min)
                                 30. Notifica cliente
31. Vê fotos antes/depois
32. Vê checklist
33. [Aprovar serviço]
                                 34. Captura pagamento (Pagar.me)
                                 35. Agenda repasse (D+3 Tier 2)
36. Recebe comprovante
37. Avalia prestador (5 estrelas)
                                 38. Atualiza score do prestador
                                                                  39. Recebe avaliação
                                                                  40. Saldo atualizado (+R$ 96)
                                                                      (R$ 120 - 20% comissão Tier 2)

Tempo total: 1h 5min de execução | 26h do pedido à conclusão
Intervenção humana: Zero (após job 100; manual antes disso)
```

#### 4.3.2 Fluxo: Cold-Start do Matching (Nenhum Prestador Disponível)

Este fluxo é crítico e frequente nos primeiros meses. Precisa de tratamento explícito.

```
SISTEMA VERIFICA DISPONIBILIDADE

Cenário A — Sem prestador disponível no raio imediato
→ Sistema expande raio automaticamente: 5km → 8km → 12km
→ Se ainda sem prestador:
  - Para pedidos URGENTES: operador recebe alerta imediato,
    liga para top 3 prestadores off-duty
  - Para pedidos NORMAIS: entra em fila de espera
    com SLA de 2h para confirmação

Cenário B — Todos os prestadores no limite diário de jobs
(Tier 1: 3 jobs; Tier 2: 10 jobs)
→ Sistema busca prestadores próximos do limite
   mas que aceitariam job extra se incentivado
→ Backoffice contata manualmente (nos primeiros 6 meses)
→ Fallback: cliente recebe opção de reagendar para próxima disponibilidade

Cenário C — Prestador aceita mas não aparece (no-show)
→ Após 30 min além do horário previsto sem atualização:
  - Sistema manda push para prestador: "Você chegou?"
→ Após 45 min sem resposta:
  - Alerta automático para backoffice
  - Operador tenta contato direto com prestador
  - Sistema busca substituto imediato
→ Após 1h:
  - Prestador marcado como no-show (flag crítico no score)
  - Suspensão automática de 7 dias
  - Cliente recebe R$ 30 de crédito + opção de novo agendamento sem custo
  - Reatribuição ou cancelamento conforme preferência do cliente

Cenário D — Prestador cancela com <4h de antecedência
→ Sistema tenta reatribuição automática (mesmo raio + disponibilidade)
→ Se encontrar substituto em <30min: notifica cliente com desculpas + R$ 20 crédito
→ Se não encontrar em 30min: operador liga para cliente
   - Opção 1: Reagendamento para próxima disponibilidade + R$ 30 crédito
   - Opção 2: Cancelamento sem taxa + R$ 30 crédito
→ Prestador que cancelou: suspensão 7 dias + flag de score
```

#### 4.3.3 Fluxo: Pedido com Adicional (Critical Path)

```
[DURANTE EXECUÇÃO]

PRESTADOR                        SISTEMA                         CLIENTE

1. Identifica problema:
   "Disjuntor também queimado"
2. Tira foto do disjuntor
   (câmera nativa — sem galeria)
3. [Solicitar adicional]
   - Motivo: Material extra
   - Descrição: "Disjuntor 30A queimado"
   - Foto: [anexa — obrigatória]
   - Valor: R$ 60
4. [Enviar]
                                 5. Valida foto (não é duplicata —
                                    Google Vision API)
                                 6. Checa histórico prestador:
                                    - Taxa de adicional: 22% (OK)
                                    - Nenhuma flag de abuso
                                 7. Notifica cliente (push + in-app)
                                                                  8. Recebe notificação
                                                                  9. Vê foto + descrição
                                                                  10. Opções:
                                                                      [Aprovar R$ 60]
                                                                      [Recusar]
                                                                      [Falar com Suporte]
                                                                  11. [Aprovar]
                                 12. Atualiza valor total: R$ 180
                                 13. Pré-autoriza adicional (Pagar.me)
                                 14. Notifica prestador
15. Recebe aprovação
16. Executa adicional
17. [Concluir serviço]
                                 18. Captura R$ 180 (Pagar.me)
                                 19. Split: R$ 144 para prestador
                                     (Tier 2: 20% comissão)
```

**Edge Case — Adicional Recusado:**
```
Cliente [Recusar adicional]
→ Sistema oferece:
  - Continuar serviço original (só o escopo contratado)
  - Cancelar tudo e pagar taxa de visita (R$ 40)
→ Se continuar: Prestador conclui escopo original
→ Se cancelar: Cliente paga R$ 40 | Prestador recebe R$ 30 (75%)
```

**Edge Case — Adicional Abusivo (>100% do valor base):**
```
Prestador solicita R$ 300 adicional em job de R$ 120
→ Sistema detecta: Adicional >100% do valor base
→ Ação automática:
  - Congela solicitação
  - Notifica operação (backoffice)
  - Operador liga para cliente E prestador dentro de 30min
  - Decisão manual documentada
  - Se abuso confirmado: flag no prestador → pode resultar em suspensão
  - Se legítimo: operador aprova manualmente com justificativa registrada
```

#### 4.3.4 Fluxo: Disputa

```
CLIENTE                          SISTEMA                         PRESTADOR

[3 HORAS APÓS CONCLUSÃO]

1. Aciona [Contestar serviço]
2. Motivo: "Chuveiro vazando"
3. Upload foto do vazamento
4. Descrição: "Pingando na ligação"
                                 5. Congela repasse do prestador
                                 6. Cria ticket de disputa (SLA: 48h)
                                 7. Notifica prestador
                                                                  8. Recebe notificação
                                                                  9. Responde e aciona retorno
                                 10. Agenda retorno sem custo ao cliente
                                                                  11. Retorna e corrige
                                                                  12. Foto corrigida
                                                                  13. [Concluir correção]
14. Recebe: "Correção concluída"
15. Valida: Vazamento parou
16. [Aprovar correção]
                                 17. Libera repasse integral
                                 18. NÃO penaliza prestador
                                     (correção rápida = boa fé)
                                 19. Fecha disputa
```

**Edge Case — Prestador Recusa Retornar:**
```
→ Sistema escala para operação imediatamente
→ Operador analisa evidências (foto ANTES do prestador + foto do defeito do cliente)
→ Se cliente correto:
  - Novo prestador enviado (sem custo ao cliente)
  - Custo deduzido do repasse do primeiro prestador (até 100%)
  - Flag crítico no score
→ Se cliente incorreto:
  - Libera repasse
  - Operador explica ao cliente com evidências
```

**Edge Case — Disputa Complexa (dano à propriedade):**
```
Cliente: "Danificou minha parede"
Prestador: "Parede já estava danificada"
→ Sistema analisa foto ANTES:
  - Mostra parede OK → Prestador errado → estorno parcial/total
  - Mostra dano prévio → Cliente tentando fraude → libera prestador
  - Inconclusiva → Operação liga para ambos dentro de 2h
    * Em casos >R$ 500: pode solicitar laudo externo
    * Decisão baseada em: histórico do prestador, histórico do cliente,
      verossimilhança técnica documentada
```

### 4.4 Regras de Negócio (Não Negociáveis)

#### 4.4.1 Pagamento (via Pagar.me)

| Regra | Detalhamento |
|---|---|
| Pagamento obrigatório no app | Pagamento externo invalida garantia + pode suspender conta |
| Pré-autorização | Cartão pré-autorizado no agendamento, captura na aprovação |
| Bloqueio em disputa | Repasse congelado até resolução (max 7 dias úteis) |
| Nenhum dinheiro fora da plataforma | Detectado via chat, padrões de comportamento |
| Split automático | Pagar.me processa split diretamente para subconta do prestador (MEI) |

#### 4.4.2 Evidência Fotográfica

| Regra | Detalhamento |
|---|---|
| Fotos obrigatórias | Mínimo 1 ANTES + 1 DEPOIS para serviços >R$ 80 |
| Captura no app | App do prestador usa câmera nativa (React Native) — sem upload de galeria para serviços críticos |
| Metadata obrigatória | Timestamp + geolocalização (exigido via permissão de câmera nativa) |
| Validação anti-reciclagem | Google Vision API (reverse image search) |
| Critérios de qualidade mínima (validados manualmente nos primeiros 200 jobs): | Foto com iluminação suficiente para identificar o item; item principal visível e em foco; não pode ser foto de estoque (TinEye API) |
| Bloqueio por evidência fraca | 3 conclusões com foto inadequada = suspensão de 7 dias |

#### 4.4.3 Garantia

> **Nota legal importante:** A garantia deve ser estruturada juridicamente como "política de satisfação da plataforma" (custeada pelo caixa da FACILITA), e não como produto de seguro. Coberturas com ressarcimento financeiro podem ser enquadradas como seguro pela SUSEP, sujeito a multas. Consulta jurídica obrigatória antes do lançamento público.

| Aspecto | Definição |
|---|---|
| Cobertura | 30 dias corridos a partir da conclusão |
| Escopo | Apenas o que foi executado (ex: se trocou chuveiro, cobre chuveiro) |
| Exclusões | Dano por terceiro, uso inadequado, intervenção externa, desastres naturais, material fornecido pelo cliente com defeito |
| Acionamento | Até 24h após identificar problema |
| Execução | Mesmo prestador retorna (se recusar ou tiver saído da plataforma, outro vai sem custo ao cliente) |
| Limite financeiro | Até 100% do valor pago no serviço original |
| Invalida garantia | Pagamento fora do app, execução sem evidência mínima, cliente alterou o trabalho |
| Provisão | 4% por pedido (R$ 6/pedido médio) — reservar mensalmente |

#### 4.4.4 Cancelamento

| Quem | Quando | Taxa |
|---|---|---|
| Cliente | Até 2h antes do agendamento | R$ 0 |
| Cliente | Entre 2h e chegada do prestador | R$ 20 (taxa de deslocamento) |
| Cliente | Após chegada do prestador | R$ 40 + material já comprado |
| Prestador | Até 4h antes | Sem penalidade financeira (mas afeta score com motivo registrado) |
| Prestador | <4h antes ou no-show | Suspensão 7 dias |
| Sistema | Fraude detectada | R$ 0 + ban |

#### 4.4.5 Adicional

| Regra | Detalhamento |
|---|---|
| Foto obrigatória | Sem foto da situação adicional = bloqueio automático |
| Captura no app | Câmera nativa — sem galeria (evita foto reciclada) |
| Justificativa | Dropdown + campo aberto |
| Limite por job | Max 3 solicitações (após 3ª, vai para revisão manual) |
| Limite de valor | Adicional >100% do valor base = revisão manual obrigatória |
| Aprovação do cliente | Sem aprovação = não pode cobrar |
| Material Básico Incluso | Até R$ 30 sem aprovação explícita (com nota fiscal) |
| Monitoramento | Taxa de adicional >50% dos jobs = flag de risco + call de operação |

#### 4.4.6 Score, Tiers e Destravamento de Pagamento

**Cálculo do Score (0-100) — Janela Rolante de 90 Dias:**

| Componente | Peso | Como Medir | Notas |
|---|---|---|---|
| Taxa de aceitação | 15% | Jobs aceitos / Jobs oferecidos | Recusas com motivo válido (dropdown) têm peso reduzido (50%) |
| Pontualidade | 20% | Chegadas no horário (±15min) | |
| Taxa de conclusão | 25% | Jobs concluídos / Jobs aceitos | |
| Qualidade de evidência | 15% | Score médio das fotos (manual nos primeiros 200 jobs, automático depois) | |
| Avaliação do cliente | 15% | Média ponderada (critérios) | |
| Taxa de reabertura | 10% | Jobs reabertos (disputa/garantia) / Total | |

**Janela rolante de 90 dias:** Score recalculado semanalmente com base nos últimos 90 dias, não desde o início. Isso evita que um episódio ruim no início afete permanentemente o prestador e desencoraja quem ficou inativo por doença.

**Tiers e Destravamento Progressivo:**

| Tier | Volume (Jobs com Score >70) | Comissão | Repasse | Antecipação | Prioridade | Limite Diário |
|---|---|---|---|---|---|---|
| 1 - Bronze (Iniciante) | 0 - 15 | 25% | D+15 | ❌ | Baixa | 3 |
| 2 - Prata (Verificado) | 16 - 50 | 20% | D+7 | ✅ Sim (2,5%) | Média | 10 |
| 3 - Ouro (Elite) | 51+ | 18% | D+2 | ✅ Sim (2,0%) | Alta | Ilimitado |

Subida de Tier é automática ao atingir volume com score >70.

### 4.5 Antifraude (Operacional)

#### 4.5.1 Camadas de Proteção

**Camada 1: Cadastro**

| Verificação | Ferramenta | Ação se Falhar |
|---|---|---|
| CPF válido | Receita Federal API | Bloqueio imediato |
| MEI ativo (prestador) | Portal do Empreendedor API | Bloqueio + orientação de abertura |
| Telefone de operadora real | Twilio Verify | Bloqueio imediato |
| Email válido | SMTP check + domínio | Aviso (não bloqueia) |
| Selfie = documento | Truora | Bloqueio (prestador) |
| Antecedentes criminais | Checagem.com | Bloqueio se crime grave (violência, estelionato) |
| Conta bancária = CPF/MEI | Pagar.me (validação nativa) | Bloqueio imediato |

**Camada 2: Comportamental**

| Sinal de Fraude | Detecção | Ação |
|---|---|---|
| Múltiplas contas mesmo device | Device fingerprint (Fingerprint.com) | Bloqueio após 2ª conta |
| Mesmo IP para cliente + prestador | IP tracking | Flag de conluio (revisão manual) |
| Troca de contato no chat | Regex: telefones, "whats", "zap", "chama", "@usuário" | Aviso 1 → Suspensão 7d → Ban |
| Adicional >150% | Regra de negócio | Revisão manual |
| Cliente nunca mais voltou após job | Análise de coorte | Flag de desintermediação |
| Prestador só clientes únicos | Taxa de recorrência <10% | Investigação de conluio |

**Camada 3: Evidência**

| Verificação | Como | Ferramenta |
|---|---|---|
| Foto reciclada | Reverse image search | Google Vision API |
| Metadata adulterada | EXIF timestamp vs. horário do job | ExifTool |
| Geolocalização | GPS da foto vs. endereço | EXIF GPS |
| Foto de estoque | Match em banco de imagens | TinEye API |

**Camada 4: Financeira**

| Risco | Detecção | Ação |
|---|---|---|
| Chargeback | Webhook Pagar.me | Congela todos recebíveis da conta |
| Cartão de teste | BIN validation (Pagar.me) | Bloqueio |
| Múltiplos cartões mesma conta | Histórico de pagamentos | Flag após 3º cartão em 30 dias |
| Valor muito alto (outlier) | Regra: >3x ticket médio | Revisão manual antes de captura |

#### 4.5.2 Ações Automáticas vs. Manuais

| Situação | Automática | Manual |
|---|---|---|
| CPF inválido | ✅ Bloqueio | ❌ |
| MEI inativo (prestador) | ✅ Bloqueio + orientação | ❌ |
| Antecedentes leves | ❌ | ✅ Análise caso a caso |
| Telefone no chat (1ª vez) | ✅ Aviso educativo | ❌ |
| Telefone no chat (3ª vez) | ✅ Ban | ❌ |
| Foto reciclada | ✅ Bloqueio de conclusão | ✅ Operador valida |
| Adicional >100% | ❌ | ✅ Operador liga para ambos |
| Disputa | ❌ | ✅ Sempre manual |
| Chargeback | ✅ Congela recebíveis | ✅ Investigação completa |
