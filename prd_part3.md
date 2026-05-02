---

## 8. RISCOS E MITIGAÇÕES

### 8.1 Riscos Estratégicos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| GetNinjas copia modelo transacional | Média | Alto | Focar em qualidade/nicho que eles não conseguem replicar por escala |
| Não conseguir densidade operacional | Alta | Crítico | Começar microscópico (3-5 bairros), só expandir com >70% utilização |
| Prestadores fogem para fora do app | Alta | Crítico | Detecção agressiva + banimento + beneficiar quem fica (tiers + repasse rápido) |
| Comissão ainda é alta demais | Média | Alto | Testar 15% com grupo controle no Mês 6 |
| LTV baixo (cliente usa 1x e sai) | Alta | Alto | Programa de fidelidade desde Mês 1 + email marketing |
| Churn de prestador bom | Média | Alto | Tier 3 com benefícios reais (repasse D+2, antecipação 2%, prioridade) |
| Concorrente grande entra (iFood/Rappi) | Baixa | Crítico | Dobrar em qualidade; verticalizar em elétrica/hidráulica de emergência; ir para B2B |

### 8.2 Riscos Operacionais

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Custo de suporte explode | Alta | Alto | Automação agressiva após Mês 6 (chatbot, FAQ, self-service) |
| Disputas >10% dos pedidos | Média | Alto | Evidência obrigatória + garantia clara + call de operação em 100% das disputas |
| Fraude de conluio em massa | Média | Crítico | Detecção desde dia 1 + banimento imediato + blacklist |
| Qualidade cai com escala | Alta | Alto | Não aceitar novos prestadores se score médio <70 |
| Cold-start sem prestador disponível | Alta (início) | Alto | Matching manual + expansão de raio + backoffice em plantão |
| Prestador cancela no último minuto | Alta | Médio | Fluxo de reatribuição explícito + crédito ao cliente + suspensão do prestador |

### 8.3 Riscos Financeiros

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Chargeback >3% | Média | Alto | KYC rigoroso + captura só após aprovação + seguro antifraude |
| CAC Google Ads >R$ 80 | Alta | Alto | Pivotar para orgânico + indicação se não otimizar em 6 meses |
| Burn 50% maior que previsto | Média | Crítico | Buffer de 50% na captação (R$ 1,5M) + corte de marketing se runway <9 meses |
| Não levantar Série A | Média | Crítico | Atingir 2K pedidos/mês + NPS >60 + break-even visível até Mês 18 |
| Garantias/disputas acima do provisionado | Média | Médio | Provisão de 4% por pedido (R$ 6/pedido) revisada mensalmente |

### 8.4 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Push notification falha no iOS (PWA) | Alta se PWA | Crítico | **Resolvido:** App do prestador é React Native/Expo — push nativo garantido |
| Sistema cai em momento crítico | Baixa | Alto | Uptime >99,5% + fallback manual via telefone/WhatsApp de suporte |
| Fraude técnica (API abuse) | Média | Médio | Rate limiting por endpoint + autenticação forte + Sentry |
| Vazamento de dados (LGPD) | Baixa | Crítico | Criptografia de dados sensíveis + auditoria de segurança antes do soft launch |
| Dívida técnica impede escala | Alta | Alto | 20% do tempo de dev dedicado a refactoring |
| Offline sync com conflito de dados | Média | Médio | Estratégia last-write-wins + log de sincronização no OrderTimeline |

### 8.5 Riscos Jurídicos e Regulatórios

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Garantia enquadrada como seguro (SUSEP) | Média | Alto | Estruturar como "política de satisfação" (não produto de seguro); consulta jurídica especializada obrigatória antes do lançamento |
| Vínculo trabalhista com prestadores | Média | Alto | Contrato de parceria robusto + liberdade de aceite/recusa + sem exclusividade + sem controle de horário |
| LGPD: dados biométricos/selfie | Média | Alto | Consentimento explícito + DPO terceirizado + política de retenção de dados clara |
| MEI: prestador atinge teto de faturamento | Baixa | Médio | Monitorar faturamento dos prestadores Tier 3 + orientação de upgrade para ME quando necessário |

### 8.6 Plano de Contingência

**Cenário 1: Burn Alto (Runway <6 meses)**
1. Cortar marketing em 50%
2. Congelar novas contratações
3. Renegociar contratos de terceiros (Stream.io, Mixpanel)
4. Buscar bridge round (R$ 200-300K)
5. Considerar pivotar para B2B (síndicos) — LTV maior, CAC menor

**Cenário 2: Churn de Prestador >50%**
1. Entrevista de saída com 100% dos que saem
2. Reduzir comissão emergencialmente (15% temporário)
3. Bônus de R$ 500 para quem fica 6 meses
4. Recrutamento emergencial (100 novos, aprovar 30)

**Cenário 3: Qualidade Cai (NPS <30)**
1. Pausar marketing imediatamente
2. Auditoria de 100% dos prestadores (retestar qualidade)
3. Desativar bottom 20% (score <40)
4. Ligar para 100% dos clientes insatisfeitos
5. Oferecer serviço gratuito de compensação

---

## 9. MÉTRICAS E KPIS

### 9.1 North Star Metric

**Pedidos concluídos com sucesso (sem reabertura em 7 dias) por mês**

Por quê: Captura crescimento (volume) + qualidade (conclusão sem disputa) + confiança do prestador (retornou quando necessário).

### 9.2 Métricas Primárias (Dashboard Diário)

**Lado Cliente**

| Métrica | Meta Beta (80 jobs) | Meta Mês 12 | Como Medir |
|---|---|---|---|
| Pedidos criados | 80 total | 2.000/mês | Count(orders WHERE created_at) |
| Taxa de conversão (cadastro → pedido) | >30% | >40% | Pedidos / Cadastros |
| Tempo até primeiro atendimento | <6h (urgente) / <24h (normal) | <4h / <18h | Avg(accepted_at - created_at) |
| Taxa de conclusão | >70% | >85% | Concluded / Accepted |
| Taxa de disputa | <5% | <3% | Disputes / Concluded |
| NPS | >50 | >70 | Survey pós-serviço |
| Churn (não voltou em 90 dias) | <60% | <40% | Clientes sem pedido em 90d |

**Lado Prestador**

| Métrica | Meta Beta | Meta Mês 12 | Como Medir |
|---|---|---|---|
| Prestadores ativos (>1 job/mês) | 15 | 50 | Count(providers WHERE jobs>0 in 30d) |
| Taxa de aceitação | >70% | >80% | Accepted / Offered |
| Pontualidade (±15min) | >85% | >90% | On-time / Total |
| Taxa de reabertura | <5% | <3% | Reopened / Concluded |
| Score médio | >60 | >75 | Avg(provider.score) |
| Churn prestador (30 dias sem job) | <40% | <20% | Providers sem job em 30d / Total |
| Tempo médio de aceite de job | <8 min | <5 min | Avg(accepted_at - offered_at) |

**Financeiro**

| Métrica | Meta Beta | Meta Mês 12 | Como Medir |
|---|---|---|---|
| Receita bruta | R$ 7K (80 jobs) | R$ 93K | Sum(orders.total) |
| Take rate efetivo | 20% | 24% | Receita plataforma / Receita bruta |
| CAC | R$ 60 | R$ 46 | Marketing spend / Novos clientes |
| LTV | R$ 345 (2,3 jobs) | R$ 810 (4,5 jobs) | Ticket médio × Jobs por cliente |
| LTV/CAC | >5x | >15x | LTV / CAC |
| Chargeback | <2% | <1% | Chargebacks / Receita |
| Garantias acionadas | <5% | <3% | Garantias / Pedidos concluídos |

**Operacional & Suporte**

| Métrica | Meta Beta | Meta Mês 12 | Como Medir |
|---|---|---|---|
| SLA Suporte N1 (Bot/FAQ) | <1 min | <30 seg | Automação / Total queries |
| SLA Suporte N2 (Humano Ops) | <15 min | <10 min | Response time (Zendesk/Intercom) |
| SLA Resolução Disputa (N3) | <48h | <24h | Avg(resolved_at - created_at) |
| Taxa de intervenção manual | 100% (beta) | <30% | Pedidos com ação humana / Total |
| Uptime | >99% | >99,9% | Monitoramento Sentry/Render |
| Fraud rate | <3% | <1% | Pedidos bloqueados / Total |
| Jobs sem prestador disponível (cold-start) | <20% | <5% | Jobs em fila / Total |

### 9.3 Dashboards

**Dashboard Executivo (CEO/Fundador)**
- North Star (gráfico mensal)
- Receita vs. Burn (runway em meses)
- CAC vs. LTV
- NPS
- Jobs em cold-start (indicador de saúde da oferta)
- Alertas críticos (uptime, fraude, disputas >SLA)

**Dashboard de Produto**
- Funil de conversão (cada step)
- Tempo médio em cada estado do pedido
- Abandono por tela
- Feature adoption

**Dashboard de Operação**
- Fila de disputas (ordenada por SLA)
- Pedidos sem prestador (cold-start em tempo real)
- Prestadores aguardando aprovação
- Sinais de fraude (últimas 24h)
- Jobs em execução agora (mapa)

**Dashboard Financeiro**
- Receita diária/semanal/mensal
- Comissão por tier
- Repasses Pagar.me agendados
- Previsão de caixa (30/60/90 dias)
- Provisão de garantia vs. acionamentos reais

---

## 10. GARANTIA (Detalhamento Jurídico-Operacional)

> **⚠️ Aviso jurídico obrigatório:** Antes do lançamento público, a estrutura jurídica desta garantia deve ser validada por advogado com experiência em direito regulatório de seguros. Coberturas com ressarcimento financeiro podem ser classificadas como seguro pela SUSEP (Superintendência de Seguros Privados). A recomendação é estruturar como "política de satisfação da plataforma" — custeada pelo caixa da FACILITA, não por prêmio cobrado ao cliente ou prestador — o que tipicamente não exige licença de seguradora. Esta nota deve ser mantida enquanto a consulta jurídica não for concluída.

### 10.1 Escopo da Garantia

**Cobertura:** 30 dias corridos a partir da conclusão

**O que está coberto:**

| Situação | Cobertura | Exemplo |
|---|---|---|
| Defeito na execução | ✅ Sim | Chuveiro instalado, mas vazando |
| Material defeituoso (fornecido pelo prestador) | ✅ Sim | Torneira instalada quebrou em 10 dias |
| Serviço parcialmente executado | ✅ Sim | Instalou ventilador mas não funciona |

**O que NÃO está coberto:**

| Situação | Motivo |
|---|---|
| Uso inadequado pelo cliente | "Chuveiro queimou porque aumentei a voltagem" |
| Intervenção de terceiro | "Chamei outro eletricista e ele mexeu" |
| Dano por terceiro | "Meu filho puxou e quebrou" |
| Desastre natural | Enchente, raio |
| Material fornecido pelo cliente com defeito | "Comprei chuveiro barato que quebrou" |
| Pagamento fora do app | Invalida toda garantia |
| Serviço sem evidência fotográfica mínima | Não tem como provar o que foi feito |

### 10.2 Processo de Acionamento

```
CLIENTE                          SISTEMA                         OPERAÇÃO

1. [Acionar garantia]
2. Descreve problema
3. Upload foto do defeito
                                 4. Valida elegibilidade:
                                    - Pedido pago no app?
                                    - Dentro de 30 dias?
                                    - Escopo coberto?
                                    - Sem exclusão?
                                 5. Se elegível:
                                    - Cria ticket
                                    - Notifica prestador original
                                                                  6. Analisa caso
                                                                  7. Liga para cliente (valida)
PRESTADOR:
8. [Aceitar retorno]
9. Agenda com cliente
10. Executa correção
11. Upload evidência
12. [Concluir]
                                 13. Cliente aprova?
                                    Sim → Fecha garantia
                                    Não → Escala para operação
                                                                  14. Decisão:
                                                                    A) Prestador corrigiu → OK
                                                                    B) Precisa outro prestador
                                                                    C) Estorno parcial (Pagar.me)

SE PRESTADOR RECUSA OU SAIU DA PLATAFORMA:
                                 15. Busca outro prestador disponível
                                 16. Envia sem custo ao cliente
                                 17. Custo deduzido do repasse do primeiro
                                     (ou absorvido pela plataforma se prestador já desligado)
```

**SLA:**
- Primeira resposta: 4h (horário comercial)
- Resolução: 48h (serviços urgentes) | 72h (demais)

### 10.3 Responsabilidade Financeira

| Cenário | Quem Paga |
|---|---|
| Correção simples (prestador retorna) | Prestador (tempo dele) |
| Prestador recusa retornar | Deduz do repasse dele (até 100%) |
| Prestador saiu da plataforma | Plataforma absorve (custo de marca) |
| Responsabilidade incerta | Plataforma assume (custo de marca) |

**Provisão:**
- Estimar 3-5% dos pedidos acionam garantia
- Custo médio: R$ 80 (meio serviço)
- Provisão: 4% × R$ 150 = R$ 6/pedido — reservar mensalmente em conta separada

---

## 11. CRONOGRAMA EXECUTIVO (6 MESES ATÉ SOFT LAUNCH)

### Mês 1-2: Fundação

**Semanas 1-2:**
- [ ] Fechar time (2 devs senior, 1 produto/fundador)
- [ ] Assinar contrato Pagar.me (marketplace)
- [ ] Consulta jurídica: garantia vs. seguro, contrato de parceria, MEI
- [ ] Definir catálogo final (13 serviços, fases de lançamento)
- [ ] Criar LTDA + contratos
- [ ] Schema Prisma completo (todas as entidades) revisado e aprovado
- [ ] Setup infraestrutura (Render + Supabase + GitHub Actions)

**Semanas 3-5:**
- [ ] Sprint 1: Autenticação + onboarding (com validação MEI)
- [ ] Design system completo + wireframes de todas as telas
- [ ] Iniciar recrutamento de prestadores (meta: 10 identificados)

**Semanas 6-8:**
- [ ] Sprint 2: Catálogo + pedido (só elétrica)
- [ ] Recrutar e cadastrar primeiros 5 prestadores manualmente

**Investimento Mês 1-2:** R$ 140K

### Mês 3-4: Construção

**Semanas 9-14:**
- [ ] Sprint 3: Execução + chat (Stream.io)
- [ ] Sprint 4: Pagamento (Pagar.me) + evidência
- [ ] Finalizar recrutamento: 15 prestadores aprovados
- [ ] Treinamento de prestadores (1 dia presencial)
- [ ] Job-shadowing: fundador/ops acompanha primeiros 10 jobs
- [ ] Contratar 2 operadores (começam semana 14)

**Semanas 15-17:**
- [ ] Sprint 5: Pós-serviço + garantia
- [ ] Criar playbooks de operação (suporte, disputa, garantia)
- [ ] Recrutar 50 clientes beta (amigos, startups, condomínios parceiros)
- [ ] Testes internos: 5 pedidos reais com pagamento

**Investimento Mês 3-4:** R$ 170K

### Mês 5: Antifraude + Beta Fechado

**Semanas 18-20:**
- [ ] Sprint 6: KYC automatizado + antifraude completo
- [ ] Teste de penetração básico (R$ 8-15K com empresa especializada)
- [ ] Auditoria de segurança: dados pessoais e LGPD

**Semanas 21-22:**
- [ ] Sprint 7: Beta fechado (50 clientes, só elétrica, 5 bairros)
- [ ] Monitoramento 100% dos jobs pelo backoffice
- [ ] Meta gate: 80 pedidos | NPS >50 | conclusão >70% | disputas <5%
- [ ] Se NÃO atingir: pausar e corrigir. Se SIM: seguir.

**Investimento Mês 5:** R$ 100K

### Mês 6: Soft Launch

**Semanas 23-24:**
- [ ] Sprint 8: Expansão de catálogo (via feature flag: hidráulica + reparos)
- [ ] Google Ads (budget R$ 5K)
- [ ] Programa de indicação ativo
- [ ] Meta: 200 pedidos no mês

**Investimento Mês 6:** R$ 60K

**Total 6 meses (operação + produto + marketing):** R$ 470K + R$ 50K reserva contingência = **R$ 520K até soft launch**

### 11.1 Regras de Gate (Bloqueios Obrigatórios)

**Gate 1 (Mês 5 — Pós-Beta Fechado):**
- [ ] 80 pedidos concluídos?
- [ ] Taxa de conclusão >70%?
- [ ] NPS >50?
- [ ] Disputas <5%?
- [ ] Antifraude 100% funcional?

Se **SIM** em todos: Avançar para Soft Launch.
Se **NÃO** em qualquer um: Pausar, identificar causa, corrigir antes de avançar.

**Gate 2 (Mês 6 — Pós-Soft Launch):**
- [ ] 600 pedidos no mês?
- [ ] CAC <R$ 70?
- [ ] Churn <50%?
- [ ] Score médio prestador >70?
- [ ] Cold-start rate <15%?

Se **SIM**: Preparar expansão geográfica e Série A.
Se **NÃO**: Reavaliar modelo — pode ser B2B, pode ser vertical diferente.

**Gate 3 (Mês 12):**
- [ ] 2.000 pedidos/mês?
- [ ] LTV >R$ 600?
- [ ] Caminho claro para break-even?
- [ ] Série A fechada ou em negociação avançada?

Se **SIM**: Full scale (RJ + B2B).
Se **NÃO**: Considerar venda estratégica ou down-round.

### 11.2 Roadmap de Longo Prazo

**Fase 1 — MVP Assistido (Meses 1-6)**
- Catálogo fechado (6 → 13 serviços)
- Matching semi-manual evoluindo para automático
- Pagamento interno (Pagar.me)
- Evidência básica com revisão manual
- Suporte operacional humano forte
- Região limitada (5 bairros SP)

**Fase 2 — Padronização e Antifraude (Meses 7-12)**
- Score duplo automatizado
- Regras automáticas de risco (feature flags)
- Qualidade de evidência via IA (pós-200 jobs com dados labeled)
- Repasse por tiers (D+2/D+7/D+15)
- Expansão geográfica controlada (toda Zona Sul SP)

**Fase 3 — Escala Local e Densidade (Meses 13-24)**
- Expansão SP completa
- Otimização do ranking e matching
- Garantia com playbooks por categoria
- Programa de fidelidade e recorrência

**Fase 4 — Expansão Vertical e B2B (Mês 24+)**
- Síndicos e administradoras
- Imobiliárias
- Contratos recorrentes
- Expansão para RJ
- Novas categorias correlatas (climatização, pintura)

---

## 12. DECISÕES CRÍTICAS (Founder Must Decide)

### 12.1 Estrutura Societária

- LTDA (não MEI, não SA ainda)
- 2-3 sócios (tecnologia + operação/negócio)
- Vesting: 4 anos (1 ano cliff)
- Reservar 15-20% para ESOP (funcionários-chave futuros)

### 12.2 Captação

**Rodada Recomendada:**
- Pré-seed: R$ 1,2M - 1,5M
- Valuation: R$ 4-5M (pre-money)
- Dilution: 20-30%

**Perfil de Investidor:**
- Angels com experiência em marketplace ou serviços
- Micro-VC early-stage (Bossanova, Canary, Faz, etc.)
- Evitar fundos grandes — vão querer governança que engessa no início

**Apresentar ao investidor o burn realista (R$ 1,5M), não o otimista. Fundos sérios preferem honestidade.**

### 12.3 Localização

- Tech: remoto OK
- Operação: presencial em SP, Zona Sul (perto da área de cobertura)
- Custo: R$ 3-5K/mês (coworking)

### 12.4 Marca e Domínio

- Nome: FACILITA (validar disponibilidade no INPI)
- Domínio: facilita.com.br (ou .app)
- Registro INPI: R$ 1.500

### 12.5 Questões Jurídicas Críticas

**Responsabilidade Civil:**
- Plataforma é intermediária, não empregadora
- Prestadores são autônomos (contrato de parceria, não CLT)
- Risco: processo trabalhista (prestador alega vínculo)
- Mitigação: contrato robusto + liberdade de aceite/recusa + sem exclusividade + sem controle de horário

**Seguro:**
- Seguro de Responsabilidade Civil Profissional (R$ 3-5K/ano)
- Cobre danos a terceiros causados por prestadores
- **Obrigatório antes do soft launch**

**LGPD:**
- Política de privacidade clara
- DPO terceirizado (R$ 1,5K/mês)
- Consentimento explícito para dados sensíveis (biometria facial, antecedentes)
- Política de retenção de fotos de evidência: 18 meses (após isso, deletar do S3)

**MEI dos Prestadores:**
- Exigir MEI ativo como requisito de onboarding
- Orientar abertura gratuita via gov.br no próprio app
- Monitorar faturamento anual dos Tier 3 (limite MEI: R$ 81K/ano)
- Orientar upgrade para ME quando necessário

---

## 13. CONCLUSÃO

### 13.1 Análise de Viabilidade

**✅ Pontos Fortes**
- Mercado validado (GetNinjas provou demanda)
- Dor real em ambos os lados
- Modelo defensável (evidência + garantia + antifraude)
- Timing certo (infraestrutura disponível e barata)
- Foco claro (elétrica primeiro, não "marketplace de tudo")

**❌ Riscos Reais**
- Unit economics negativo até Mês 18-24: capital paciente é necessário
- Desintermediação é endêmica: 40-60% tentarão fechar por fora no ano 1
- Operação é pesada: custo de suporte + disputa + fraude não escala sem automação
- Densidade é tudo: falhar em 2 bairros pode matar o momentum

### 13.2 Fatores Críticos de Sucesso

**Top 5 Coisas que PRECISAM acontecer:**

1. **Recrutar 15 prestadores excelentes antes de ter 1 cliente externo.** Se falhar: demanda sem oferta = morte.
2. **Atingir 70%+ de conclusão no beta fechado.** Se falhar: operação é inviável antes de escalar.
3. **NPS >50 nos primeiros 80 pedidos.** Se falhar: boca a boca negativo mata crescimento orgânico.
4. **LTV chegar a 4+ jobs até Mês 18.** Se falhar: unit economics nunca fecha.
5. **Levantar Série A de R$ 3-5M até Mês 15.** Se falhar: runway acaba, tem que vender barato ou fechar.

### 13.3 Probabilidade de Sucesso

| Cenário | Probabilidade | Requisitos |
|---|---|---|
| Unicórnio (>R$ 1Bi) | <5% | Execução perfeita + 10+ cidades + B2B massivo + R$ 50M+ |
| Sucesso Regional (R$ 50-150M) | 15-20% | Dominar SP + RJ, LTV >R$ 800, break-even |
| Negócio Sustentável (R$ 10-30M) | 30-40% | 5K pedidos/mês, margem 10-15%, operação enxuta |
| Falha | 35-45% | Não consegue densidade, churn alto, burn descontrolado |

### 13.4 Recomendação Final

Execute, mas com discipline gates.

Este é um negócio difícil, mas viável. Não é um "app fácil" que cresce viral. É operação pesada, com margem inicial baixa e risco real de commoditização.

Mas se você executar com disciplina nos primeiros 12 meses — começando pequeno, construindo bem, não escalando antes da qualidade estar comprovada — pode construir algo defensável.

GetNinjas cresceu sem qualidade e ficou com NPS ruim.
Triider tentou qualidade mas falhou em execução e marketing.

Há um espaço no meio: **qualidade operacional + crescimento controlado**.

Você precisa de:
- R$ 1,5M de capital (mínimo real)
- 18-24 meses de paciência
- Obsessão por detalhes operacionais
- Coragem para dizer "não" — não a serviços, não a bairros, não a crescimento prematuro
- Um time técnico que conhece React Native, Node.js e quer construir produto de verdade

Se você tem isso: vá em frente.
Se não tem: não vá. Esse não é um negócio para testar "part-time" ou com capital insuficiente.

---

## ANEXO A: CHECKLIST PRÉ-LANÇAMENTO

**Produto:**
- [ ] 6 serviços de elétrica no catálogo com preço fixo (feature flag: beta)
- [ ] App cliente (Next.js PWA) publicado em beta fechado
- [ ] App prestador (React Native/Expo) publicado na App Store e Play Store
- [ ] Backoffice funcional
- [ ] Pagar.me integrado e testado (autorização + captura + split)
- [ ] Chat (Stream.io) integrado e testado
- [ ] Sistema de evidências com validação (manual nos primeiros 200 jobs)
- [ ] Fluxo de garantia completo (acionamento + retorno + escalada)
- [ ] Cold-start handling (fila de espera + backoffice alertado)
- [ ] Offline sync no app do prestador (timeline)
- [ ] Feature flags (PostHog self-hosted)

**Antifraude (bloqueante para qualquer usuário externo):**
- [ ] KYC automatizado (Truora) operacional
- [ ] Background check (Checagem.com) operacional
- [ ] Device fingerprinting (Fingerprint.com) operacional
- [ ] Detecção de contato no chat (Stream.io webhook) operacional
- [ ] Google Vision API (foto reciclada) operacional
- [ ] Painel de antifraude no backoffice operacional

**Operação:**
- [ ] 15 prestadores recrutados, aprovados (com MEI) e treinados
- [ ] 2 operadores contratados e treinados
- [ ] Playbook de suporte escrito
- [ ] Playbook de disputa escrito
- [ ] Playbook de garantia escrito
- [ ] Playbook de cold-start (sem prestador disponível) escrito
- [ ] SLA definido e comunicado internamente

**Jurídico:**
- [ ] LTDA constituída
- [ ] Contrato de parceria (prestador) revisado por advogado (com cláusula MEI)
- [ ] Termos de uso (cliente) publicados
- [ ] Política de privacidade (LGPD) publicada
- [ ] Seguro de responsabilidade civil contratado
- [ ] Consulta jurídica sobre garantia vs. seguro (SUSEP) concluída
- [ ] DPO terceirizado contratado

**Segurança:**
- [ ] Pentest básico antes do soft launch
- [ ] Rate limiting em todos os endpoints críticos
- [ ] Criptografia de dados sensíveis em repouso

**Financeiro:**
- [ ] Conta bancária PJ + conta Pagar.me ativa
- [ ] Subconta Pagar.me configurada para split de prestadores
- [ ] Fluxo de caixa projetado (12 meses) revisado com salários de mercado
- [ ] Capital inicial disponível (mín. R$ 520K para 6 meses)

**Marketing:**
- [ ] Landing page publicada (SEO otimizado)
- [ ] Google Ads configurado (pausado até Gate 1)
- [ ] Programa de indicação configurado
- [ ] 50 clientes beta identificados

---

## ANEXO B: TEMPLATE DE PITCH DECK (SÉRIE SEED)

**Slide 1 — Capa**
"A forma mais confiável de resolver problemas elétricos e hidráulicos em casa"

**Slide 2 — Problema**
- Cliente: R$ 80Bi/ano em serviços domésticos sem garantia, sem preço justo, sem confiança
- Prestador bom: 15% de inadimplência, demanda irregular, concorre com quem é ruim
- 78% de informalidade, GetNinjas NPS ~25 apesar de 12 anos de mercado

**Slide 3 — Solução**
- Plataforma transacional (não marketplace de leads)
- Catálogo padronizado + Evidência obrigatória + Garantia real + Antifraude desde dia 1
- Fluxo fechado com split de pagamento automático via Pagar.me

**Slide 4 — Por que agora**
- GetNinjas educou o mercado (12 anos), mas NPS ~25
- Triider mostrou que modelo transacional é possível, mas falhou em execução
- Infraestrutura disponível: KYC, split payment, push nativo, IA para fraude

**Slide 5 — Mercado**
- TAM: R$ 80Bi (serviços domésticos Brasil)
- SAM: R$ 12Bi (SP + RJ, serviços padronizáveis)
- SOM: R$ 240Mi (ano 5, 2% do SAM)

**Slide 6 — Modelo de Negócio**
- Comissão 18-25% (tier-based, via Pagar.me)
- Receitas secundárias: urgência, antecipação, seguro estendido
- LTV: R$ 810 | CAC: R$ 46 (ano 2)

**Slide 7 — Tração (meta para apresentação)**
- 200 pedidos (mês 3 após soft launch)
- NPS: 68
- Taxa de conclusão: 82%
- 15 prestadores Tier 2-3

**Slide 8 — Go-to-Market**
- Fase 1: Densidade em 5 bairros SP (Zona Sul)
- Fase 2: Expansão SP completa
- Fase 3: RJ + B2B (síndicos, imobiliárias)

**Slide 9 — Concorrência**
- Quadrante: Controle de Qualidade (Y) vs. Facilidade de Uso (X)
- GetNinjas: alto X, baixo Y
- Triider: médio X, médio Y
- FACILITA: alto X, alto Y — única com antifraude + garantia + split desde o início

**Slide 10 — Time**
- Fundadores + background relevante
- Advisors (ex-GetNinjas, fintech, operações)

**Slide 11 — Financials**
- Burn: R$ 1,0M (12 meses, realista)
- Break-even: Mês 24
- Receita Ano 3: R$ 15M

**Slide 12 — Ask**
- Raising: R$ 1,5M
- Use of funds: 45% tech/produto, 30% marketing, 25% operação

---

## ANEXO C: RECOMENDAÇÕES DURAS (SÍNTESE)

1. **Não use PWA para o app do prestador.** Push notification confiável no iOS é bloqueante para o modelo. Use React Native/Expo.
2. **Não use Stripe como gateway principal.** Pagar.me tem split nativo para MEI, antecipação integrada e suporte em português.
3. **Não construa sem o data model completo.** Migrations em produção custam mais do que 1 semana de planejamento.
4. **Não abra para o público sem antifraude 100% funcional.** Um prestador fraudulento nos primeiros 10 jobs pode destruir a reputação no nascedouro.
5. **Não prometa garantia sem validação jurídica do risco SUSEP.** A consulta jurídica é R$ 3-5K. A autuação da SUSEP pode ser R$ 500K+.
6. **Não subestime o burn.** Os salários realistas de SP + React Native + Stream.io levam o capital necessário para R$ 1,5M, não R$ 1,1M.
7. **Não escale antes de saturar.** Abrir novos bairros antes de ter >70% de utilização nos atuais é a principal causa de falha de marketplaces de serviço.
8. **Não confie em estrelas.** Evidência operacional (fotos, checklists, metadata) vale mais que qualquer avaliação subjetiva.
9. **Não deixe pagamento fora da plataforma virar exceção.** Isso mata o modelo transacional e a segurança jurídica da garantia.
10. **A FACILITA tem mais chance de vencer se for desenhada como infraestrutura confiável de contratação, não como vitrine.** O caminho é menos sedutor no pitch, mas infinitamente mais forte na operação real.
