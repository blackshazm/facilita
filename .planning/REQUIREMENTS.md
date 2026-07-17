# Requirements

## Milestone v11.0: Live Tracking & Dispatch

### Live Tracking Core
- [ ] **TRACK-01**: Infraestrutura de WebSockets & Salas no Backend
  - O backend deve expor um WebSocket Gateway com Socket.io.
  - Cada serviço ativo cria uma `room` isolada para garantir que apenas as partes envolvidas recebam as atualizações.
- [ ] **TRACK-02**: Tracking em Background (Expo Location) no Provider App
  - O app do provedor deve capturar e transmitir as coordenadas GPS (latitude, longitude, heading) mesmo minimizado.
  - A transmissão deve incluir um debounce inteligente (ex: a cada 10s ou mudança de X metros) para economizar bateria.
- [ ] **TRACK-03**: Visualização no Mapa do Cliente em Tempo Real
  - O app do cliente (Next.js) se conecta à respectiva `room` via socket.io-client.
  - A posição do provedor é renderizada e atualizada ativamente sobre o mapa enquanto a ordem de serviço estiver "In Progress".

## Future Requirements
- **TRACK-04**: Alertas via Push (Geofencing - ex: "Provedor está chegando").
- **TRACK-05**: Histórico de Rotas & Auditoria Anti-Fraude.

## Out of Scope
- Integração com sistemas de frota externa (apenas providers autônomos no momento).
- Edição de rotas em tempo real pelo cliente.

## Traceability
| Requirement | Phase |
|-------------|-------|
| TRACK-01 | Phase 11.1 |
| TRACK-02 | Phase 11.2 |
| TRACK-03 | Phase 11.3 |
