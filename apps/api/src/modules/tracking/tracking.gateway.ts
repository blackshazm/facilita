import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Implement token validation here if needed
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToOrder')
  handleSubscribe(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (orderId) {
      const room = `order_${orderId}`;
      client.join(room);
      console.log(`Client ${client.id} joined ${room}`);
      return { status: 'success', room };
    }
    return { status: 'error', message: 'orderId is required' };
  }

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(
    @MessageBody() data: { orderId: string; lat: number; lng: number; heading?: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (data && data.orderId) {
      const room = `order_${data.orderId}`;
      // Broadcast to all clients in the room EXCEPT the sender
      // Or server.to(room) to send to everyone including sender
      this.server.to(room).emit('locationUpdated', {
        orderId: data.orderId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
