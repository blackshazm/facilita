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
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LocationUpdatePayload } from '@facilita/contracts';

@Injectable()
@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  // Mapeia orderId -> providers conectados, para gerenciar rooms
  private providerLocations = new Map<string, { lat: number; lng: number }>();

  async handleConnection(client: Socket) {
    this.logger.log(`Client trying to connect: ${client.id}`);
    
    // JWT Stateless Authentication (High-Ride-API style)
    const token = client.handshake.auth?.token;
    if (!token) {
      this.logger.error(`Connection rejected: Missing JWT token for client ${client.id}`);
      client.disconnect();
      return;
    }
    
    // Em produção, isso seria verificado via JwtService
    if (token !== 'valid-mock-token') {
      this.logger.error(`Connection rejected: Invalid JWT token for client ${client.id}`);
      client.disconnect();
      return;
    }

    this.logger.log(`Client authenticated successfully: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('update_location')
  handleLocationUpdate(
    @MessageBody() data: LocationUpdatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Location updated for Provider ${data.providerId} at [${data.latitude}, ${data.longitude}]`);
    
    // Atualiza cache rápido em memória (Numa prod clusterizada, usaríamos Redis)
    this.providerLocations.set(data.providerId, {
      lat: data.latitude,
      lng: data.longitude,
    });

    // Se tivermos a corrida, podemos usar Rooms: client.to(data.orderId).emit(...)
    // Por enquanto, faremos o broadcast (para a UI funcionar)
    this.server.emit('location_updated', data);
  }
}
