# Roadmap — FACILITA v7.0

## Milestone: Expansion & Payouts (Current)
*Goal: Automate the financial lifecycle, enable regional scale, and drive organic growth through referrals.*

### Phase 7.1: Payout Automation & Ledger Hardening
- Implementar `PayoutService` para agendamento automático de transferências.
- Criar interface de gestão de dados bancários no App do Prestador.
- Hardening do Ledger para suportar reconciliação bancária (Pagar.me -> Wallet).
- **Requirements**: PAY-01, PAY-02, PAY-03
- **Success Criteria**:
    - [ ] Transferência enviada automaticamente para o Pagar.me com base no saldo da Wallet.
    - [ ] Histórico de Payouts visível no App.

### Phase 7.2: Regional Expansion & Geo-Filtering
- Implementar suporte a múltiplas cidades no Catálogo e Matching.
- Criar gestão de "Zonas de Atendimento" para prestadores.
- Otimizar `MatchingEngine` para geofencing por polígonos de cidade.
- **Requirements**: EXP-01, EXP-02
- **Success Criteria**:
    - [ ] Cliente vê apenas serviços disponíveis em sua cidade.
    - [ ] Prestador recebe apenas ordens dentro de sua zona definida.

### Phase 7.3: Viral Growth & Referral System
- Implementar motor de convites e códigos de indicação.
- Criar lógica de recompensa automática (`GROW-02`) com proteção anti-fraude.
- Dashboards de acompanhamento de indicações para usuários.
- **Requirements**: GROW-01, GROW-02, GROW-03
- **Success Criteria**:
    - [ ] Crédito inserido na Wallet automaticamente após a primeira ordem do indicado.
    - [ ] Bloqueio de 100% das tentativas de auto-indicação detectadas.

## Archived Milestones
- [v6.0: Growth & Compliance](./milestones/v6.0-ROADMAP.md) — 2026-05-06
- [v5.0: Scale & Hardening](./milestones/v5.0-ROADMAP.md) — 2026-05-04

---
*Run `/gsd-new-milestone` to start the next roadmap cycle.*
