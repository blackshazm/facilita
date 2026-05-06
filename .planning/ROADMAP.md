# Roadmap — FACILITA v6.0

## Milestone: Growth & Compliance (Current)
*Goal: Expand platform analytical capabilities, ensure fiscal compliance for 2026, and achieve full production readiness for the Provider app.*

### Phase 6.1: Operational Analytics & BI [FUNCIONAL]
- [x] Implementar motor de agregação de métricas (GMV, Match Rate, Churn).
- [x] Criar dashboard de gestão no Backoffice para visualização de KPIs.
- [x] Implementar exportação de relatórios (CSV/PDF) para BI externo.
- **Requirements**: ANL-01, ANL-02, ANL-03
- **Success Criteria**:
  - [x] Dashboard funcional com dados em tempo real (latência < 5min).
  - [x] Exportação de relatório mensal gerada com sucesso.

### Phase 6.2: Fiscal Compliance & Tax Engine [FUNCIONAL]
- [x] Atualizar cálculo de taxas de serviço para Reforma Tributária 2026.
- [x] Integrar API de emissão de NFS-e (Notas Fiscais de Serviço).
- [x] Implementar Audit Log imutável para transações financeiras.
- **Requirements**: CMP-01, CMP-02, CMP-03
- **Success Criteria**:
  - [x] Cálculo de impostos validado em sandbox conforme novas regras.
  - [x] Nota Fiscal emitida automaticamente após conclusão de ordem.

### Phase 6.3: Mobile Production & Publishing [FUNCIONAL]
- [ ] Configurar CI/CD Pipeline via Expo EAS Build & Submit.
- [ ] Implementar sistema de notificações push via Firebase Cloud Messaging.
- [ ] Finalizar Onboarding com Prova de Vida e KYC integrado.
- [ ] Implementar sincronização offline para ordens em progresso.
- **Requirements**: PRV-01, PRV-02, PRV-03, PRV-04
- **Success Criteria**:
  - Build de produção gerado e submetido para revisão na TestFlight/Play Console.
  - Notificação push recebida com sucesso em dispositivo real.

## Archived Milestones
- [v5.0: Scale & Hardening](./milestones/v5.0-ROADMAP.md) — 2026-05-04
