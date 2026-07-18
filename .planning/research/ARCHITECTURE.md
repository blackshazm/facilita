# Research: Architecture

## Objetivo
Definir como o Live Tracking se integra à arquitetura Hexagonal e de Event-Bus existente.

## Integração com a Arquitetura Atual
1. **Domain Event**: O provider envia "ProviderLocationUpdated" via WebSocket.
2. **Gateway/Anti-Corruption Layer**: Um NestJS WebSocket Gateway autentica (usando token JWT via WS) e recebe as coordenadas.
3. **Core Domain**: A regra de negócio valida se o provider está num despacho ativo (ordem de serviço 'In Progress'). Se não estiver, descarta o evento silenciosamente para economizar processamento.
4. **Data Persistence (Throttled)**: As coordenadas são persistidas no PostGIS, mas *não* a cada segundo. Elas são cacheadas no Redis e enviadas em batch (ex: a cada minuto) para o DB para evitar gargalos de I/O.
5. **Event-Bus Broadcast**: O Redis faz o Pub/Sub do evento, e os gateways disparam o evento "OrderLocationUpdate" diretamente para a sala (room) específica daquela ordem (onde o cliente está escutando).

## Componentes Novos
- `TrackingGateway`: Controlador WS para gerir as salas (rooms) de cada Order e receber pings dos provedores.
- `LocationService`: Serviço de domínio que calcula o ETA via uma API de roteamento (ex: Google Directions) ou apenas distância euclidiana pelo PostGIS.

## Ordem Sugerida de Build
1. Infrastrutura WebSocket no Backend com Redis Adapter.
2. Expo Background Location no app do Provider.
3. Componente de Mapa e Conexão Socket.IO no Next.js do Cliente.
4. Integração do cálculo de ETA e notificações (Push).
