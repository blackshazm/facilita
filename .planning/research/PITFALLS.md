# Research: Pitfalls

## Objetivo
Identificar erros comuns ao adicionar Live Tracking em sistemas de marketplaces e como preveni-us.

## Principais Pitfalls
1. **Battery Drain (App do Provider)**: Rastrear localização via GPS com alta precisão a cada segundo queima a bateria do celular.
   - *Prevenção*: Ajustar a precisão (`accuracy`) dependendo do estado (ex: baixa precisão se longe, alta se perto do destino). Transmitir apenas a cada 10-15s ou mudanças significativas de distância.
2. **Zombie Connections & Event Overload**: Se milhares de provedores abrirem conexões WS que ficam "travadas" na memória, o backend trava (OOM).
   - *Prevenção*: Timeout agresivo em WebSockets inativos. Uso estrito de Rooms (cada Order é uma room), os clientes só entram na room da sua própria order.
3. **Inconsistência de Despacho (Fraud Tracking)**: Provedores que "fingem" movimentação usando mock location (Fake GPS) para cobrar mais, se existir cobrança por KM.
   - *Prevenção*: No Android e iOS há APIs para detectar "Mock Location". Recusar atualizações marcadas como mock.
4. **Perda de Pacotes e "Pulos"**: Se a conexão do provedor cair numa zona sem sinal, a localização dele para de atualizar.
   - *Prevenção*: Armazenar os pontos localmente no dispositivo via SQLite/AsyncStorage e enviar um lote (batch sync) quando a conexão retornar. No lado do cliente, mostrar "Última atualização há X minutos" quando o sinal for perdido.
