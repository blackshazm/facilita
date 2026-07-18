---
wave: 1
depends_on: []
files_modified:
  - apps/api/package.json
  - apps/api/src/shared-kernel/adapters/redis-io.adapter.ts
  - apps/api/src/main.ts
  - apps/api/src/modules/tracking/tracking.module.ts
  - apps/api/src/modules/tracking/tracking.gateway.ts
  - apps/api/src/app.module.ts
autonomous: true
requirements:
  - TRACK-01
---

# Phase 11.1: WebSockets Infrastructure

## Tasks

### 1. Install Redis Adapter
<read_first>
- apps/api/package.json
</read_first>
<action>
Install `@socket.io/redis-adapter` inside `apps/api`. Add `"@socket.io/redis-adapter": "^8.3.0"` to dependencies.
</action>
<acceptance_criteria>
- `apps/api/package.json` contains `@socket.io/redis-adapter`
</acceptance_criteria>

### 2. Create Redis IO Adapter
<read_first>
- apps/api/src/shared-kernel/adapters/redis-io.adapter.ts (new)
</read_first>
<action>
Create `apps/api/src/shared-kernel/adapters/redis-io.adapter.ts`:
```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT) || 6379 });
    const subClient = pubClient.duplicate();
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```
</action>
<acceptance_criteria>
- `apps/api/src/shared-kernel/adapters/redis-io.adapter.ts` exists and exports `RedisIoAdapter`
</acceptance_criteria>

### 3. Register Redis Adapter in Main
<read_first>
- apps/api/src/main.ts
</read_first>
<action>
Modify `apps/api/src/main.ts`:
Import `RedisIoAdapter`. Inside `bootstrap()`, instantiate `RedisIoAdapter`, call `await redisIoAdapter.connectToRedis()`, and then `app.useWebSocketAdapter(redisIoAdapter)`.
</action>
<acceptance_criteria>
- `apps/api/src/main.ts` contains `app.useWebSocketAdapter`
</acceptance_criteria>

### 4. Create Tracking Module and Gateway
<read_first>
- apps/api/src/modules/tracking/tracking.module.ts (new)
- apps/api/src/modules/tracking/tracking.gateway.ts (new)
- apps/api/src/app.module.ts
</read_first>
<action>
Create `apps/api/src/modules/tracking/tracking.gateway.ts`:
```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Basic connection handling
  }

  @SubscribeMessage('subscribeToOrder')
  handleSubscribe(@MessageBody() orderId: string, @ConnectedSocket() client: Socket) {
    client.join(`order_${orderId}`);
  }

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(@MessageBody() data: { orderId: string, lat: number, lng: number }, @ConnectedSocket() client: Socket) {
    this.server.to(`order_${data.orderId}`).emit('locationUpdated', data);
  }
}
```
Create `apps/api/src/modules/tracking/tracking.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';

@Module({
  providers: [TrackingGateway],
})
export class TrackingModule {}
```
Modify `apps/api/src/app.module.ts` to import `TrackingModule`.
</action>
<acceptance_criteria>
- `apps/api/src/modules/tracking/tracking.gateway.ts` contains `TrackingGateway`
- `apps/api/src/app.module.ts` contains `TrackingModule`
</acceptance_criteria>

## Verification
- Run `npm run build` in `apps/api` and ensure it compiles successfully.
- Check that there are no TS errors.
