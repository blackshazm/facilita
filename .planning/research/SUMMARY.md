# Research Summary: Live Tracking & Dispatch

## Visão Geral
A implementação do rastreamento ao vivo para a FACILITA exigirá o uso intenso de WebSockets e geolocalização no app do Provedor. A fundação atual já conta com o PostGIS e o BullMQ, o que reduz o atrito, mas exige a adição de um canal de eventos em tempo real.

## Adições à Stack
- `@nestjs/websockets`, `@nestjs/platform-socket.io`, e `@socket.io/redis-adapter` no backend.
- `socket.io-client` no PWA.
- `expo-location` e `expo-task-manager` no app do provider.

## Funcionalidades de Base (Table Stakes)
- Tracking em Background contínuo e debounced no Provider.
- Emissão de eventos pelo Provider apenas durante um despacho ativo.
- Consumo via WebSocket no Cliente com mapa renderizando as posições (`react-map-gl`).

## Pontos de Atenção (Watch Out For)
- **Battery Drain**: Rastrear constantemente sem debouncing gasta bateria do provedor; a precisão precisa ser otimizada.
- **Sobrecarga (Event Overload)**: Precisamos garantir que atualizações só sejam persistidas no PostGIS em lotes e apenas enviadas ativamente via Pub/Sub para clientes em Ordens ativas (via `rooms`).
- **Loss of connection**: Lidar com reconexões gracefully armazenando pontos de GPS offline (batch sync).
