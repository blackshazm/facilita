# Research: Stack

## Objetivo
Analisar as adições e mudanças necessárias na stack atual (NestJS, Next.js, React Native/Expo) para suportar Live Tracking & Dispatch.

## Bibliotecas e Tecnologias Necessárias
- **Backend (NestJS)**:
  - `@nestjs/websockets` e `@nestjs/platform-socket.io`: Para gerenciar conexões em tempo real.
  - `@nestjs/bull` ou `bullmq`: (Já existente) Para processamento de fila assíncrono (ex: atualizações pesadas de ETA).
  - `@socket.io/redis-adapter`: Necessário se o backend tiver múltiplas instâncias (scale-out) para garantir que os eventos cheguem a todos os nós.
- **Provider App (React Native / Expo)**:
  - `expo-location`: Para rastreamento de localização, com suporte a tracking em background.
  - `expo-task-manager`: Para manter o rastreamento rodando mesmo se o app estiver em background (crítico).
- **Client App (Next.js)**:
  - `socket.io-client`: Para receber as atualizações em tempo real.
  - `react-map-gl` (Mapbox) ou Google Maps API (`@vis.gl/react-google-maps`) para renderização visual e plotagem do marcador.

## O que NÃO adicionar
- Polling via HTTP REST para localização (ineficiente, consome muita bateria e banda).
- Tracking em tempo real sem debounce no app do provider.
