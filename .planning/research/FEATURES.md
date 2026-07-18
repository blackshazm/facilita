# Research: Features

## Objetivo
Mapear o comportamento esperado e as funcionalidades alvo para o sistema de Live Tracking & Dispatch.

## Table Stakes (Essencial)
- Rastreamento em Background no Provider: O provider não pode precisar estar com a tela do app ativa para transmitir localização.
- Transmissão Contínua (Debounced): O app envia a localização a cada X segundos ou X metros deslocados.
- Visualização Ao Vivo: O cliente consegue ver o ícone do provedor movendo-se no mapa da interface web.
- Atualização de ETA: Cálculo do tempo estimado de chegada (ETA) atualizado periodicamente para o cliente.

## Differentiators (Diferenciais)
- Interpolação Suave: O ícone do veículo/provedor desliza suavemente entre as atualizações no mapa do cliente, sem pular bruscamente.
- Alertas Baseados em Geofencing: O cliente é notificado por Push quando o provedor "Estiver chegando" (ex: raio de 500m).
- Histórico de Rota de Despacho (Auditoria): Salvar periodicamente a rota real feita pelo provider para resolver disputas e verificar quilometragem (importante para fraudes).

## Complexidade e Dependências
- Alta complexidade na gestão de permissões de localização do sistema operacional móvel (iOS/Android) no app do provider.
- Requer estabilidade severa na conexão de websockets e rotinas de reconexão automática.
