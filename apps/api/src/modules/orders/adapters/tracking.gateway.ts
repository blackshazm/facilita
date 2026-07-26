import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/tracking',
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  @SubscribeMessage('subscribe_order')
  handleSubscribe(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} subscribed to tracking for order ${data.orderId}`);
    client.join(`order_${data.orderId}`);
    return { status: 'subscribed', orderId: data.orderId };
  }

  @SubscribeMessage('update_location')
  handleUpdateLocation(
    @MessageBody() data: { orderId: string; latitude: number; longitude: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast the new location to anyone subscribed to this order (usually the Customer)
    this.server.to(`order_${data.orderId}`).emit('location_updated', {
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('update_status')
  handleUpdateStatus(
    @MessageBody() data: { orderId: string; status: 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'DONE' },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Order ${data.orderId} status changed to ${data.status} by provider`);
    
    // In a real scenario, we would also call a UseCase here to persist the status to Prisma
    
    // Broadcast status change to the customer
    this.server.to(`order_${data.orderId}`).emit('status_updated', {
      status: data.status,
      timestamp: new Date().toISOString(),
    });
  }
}
