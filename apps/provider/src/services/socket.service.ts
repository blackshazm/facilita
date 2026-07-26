import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  // TODO: Em produção usar Variável de Ambiente
  private backendUrl = 'http://localhost:3333';

  connect() {
    if (!this.socket) {
      this.socket = io(this.backendUrl, { transports: ['websocket'] });
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      this.socket.on('connect_error', (error) => {
        console.error('Socket connect_error:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinOrderRoom(orderId: string) {
    if (this.socket) {
      this.socket.emit('subscribeToOrder', orderId);
    }
  }

  sendLocationUpdate(orderId: string, lat: number, lng: number, heading?: number) {
    if (this.socket) {
      this.socket.emit('updateLocation', { orderId, lat, lng, heading });
    }
  }
}

export const socketService = new SocketService();
