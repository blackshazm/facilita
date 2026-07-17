# Roadmap

## Milestone v11.0: Live Tracking & Dispatch

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 11.1 | WebSockets Infrastructure | Setup Socket.io Gateway, Redis Adapter and Rooms | TRACK-01 |
| 11.2 | Provider Background Tracking | Implement `expo-location` and transmit coordinates | TRACK-02 |
| 11.3 | Client Live Map | Render real-time provider location on Next.js map | TRACK-03 |

---

## Phase 11.1: WebSockets Infrastructure
**Goal:** Setup Socket.io Gateway, Redis Adapter and Rooms
**Requirements:** TRACK-01

**Success Criteria:**
1. Servidor NestJS responde a conexões WebSocket e autentica usando JWT.
2. É possível criar uma sala (`room`) associada ao ID de um serviço ativo e conectar clientes nela.
3. Eventos de localização emitidos por um provider loggado são roteados apenas para a sala correta.

## Phase 11.2: Provider Background Tracking
**Goal:** Implement `expo-location` and transmit coordinates
**Requirements:** TRACK-02

**Success Criteria:**
1. O app do provider consegue rastrear a localização no nível OS, mesmo em background.
2. A transmissão para o WebSocket ocorre com debouncing inteligente para economizar bateria e rede.
3. Eventos são silenciados se o provedor não possuir nenhum serviço 'In Progress'.

## Phase 11.3: Client Live Map
**Goal:** Render real-time provider location on Next.js map
**Requirements:** TRACK-03

**Success Criteria:**
1. O app do cliente se conecta à sala de WebSocket correta assim que o serviço entra em 'In Progress'.
2. Marcador no mapa atualiza a posição instantaneamente conforme as mensagens chegam.
3. Tratamento visual para "Perda de sinal" quando as mensagens pararem de chegar por um longo período.
