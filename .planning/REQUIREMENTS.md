# Milestone v6.0 Requirements — Growth & Compliance

## Overview
This milestone focuses on expanding the platform's analytical capabilities, ensuring fiscal compliance for the 2026 Brazilian tax reform, and achieving full production readiness for the Provider mobile application.

## Active Requirements

### Analytics Avançado (ANL)
- [ ] **ANL-01**: Dashboard operacional com métricas em tempo real (GMV, Match Rate, Churn) integrado ao Backoffice.
- [ ] **ANL-02**: Relatórios de performance detalhados por prestador, região e categoria de serviço.
- [ ] **ANL-03**: Exportação de dados para contabilidade e gestão operacional (CSV/PDF).

### Compliance Fiscal (CMP)
- [ ] **CMP-01**: Adaptação do motor de pagamentos (Pagar.me Split) para suportar a retenção e repasse de IBS/CBS conforme Reforma Tributária 2026.
- [ ] **CMP-02**: Geração automatizada de Notas Fiscais de Serviço (NFS-e) via API para cada ordem finalizada.
- [ ] **CMP-03**: Registro de log de auditoria fiscal para todas as transações financeiras.

### Provider App - Produção (PRV)
- [ ] **PRV-01**: Configuração de CI/CD via Expo Application Services (EAS) para builds automáticos e submissão nas lojas.
- [ ] **PRV-02**: Implementação de sistema de notificações push via Firebase Cloud Messaging (FCM) para alertas de ordens e chat.
- [ ] **PRV-03**: Fluxo completo de Onboarding com prova de vida (Liveness Check) e validação automática de documentos (KYC).
- [ ] **PRV-04**: Implementação de modo offline parcial para visualização de ordens em andamento.

## Future Requirements (Deferred)
- [ ] **ADV-01**: IA para predição de demanda por região.
- [ ] **INT-01**: Integração com sistemas de CRM externos.

## Out of Scope
- Migração para infraestrutura multi-cloud (manter AWS/Heroku por enquanto).
- Implementação de sistema de fidelidade (pontos/rewards).

## Traceability
| REQ-ID | Phase | Status |
|--------|-------|--------|
| ANL-01 | | Pending |
| ANL-02 | | Pending |
| ANL-03 | | Pending |
| CMP-01 | | Pending |
| CMP-02 | | Pending |
| CMP-03 | | Pending |
| PRV-01 | | Pending |
| PRV-02 | | Pending |
| PRV-03 | | Pending |
| PRV-04 | | Pending |
