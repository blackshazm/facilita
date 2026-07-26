import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // For development
  },
  namespace: '/matching',
})
export class MatchingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchingGateway.name);

  // Map to store connected providers: providerId -> socketId
  private connectedProviders = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to matching: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from matching: ${client.id}`);
    
    // Remove from active providers map
    for (const [providerId, socketId] of this.connectedProviders.entries()) {
      if (socketId === client.id) {
        this.connectedProviders.delete(providerId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { providerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Provider authenticated: ${data.providerId} with socket ${client.id}`);
    this.connectedProviders.set(data.providerId, client.id);
    client.join(`provider_${data.providerId}`);
    return { status: 'authenticated' };
  }

  /**
   * Emits a dispatch request to a specific provider
   */
  dispatchToProvider(providerId: string, payload: any) {
    const socketId = this.connectedProviders.get(providerId);
    if (socketId) {
      this.logger.log(`Dispatching Job ${payload.orderId} to Provider ${providerId}`);
      this.server.to(`provider_${providerId}`).emit('new_dispatch', payload);
      return true;
    }
    return false;
  }
}
