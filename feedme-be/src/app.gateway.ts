import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  emitWaitingUpdate(orders: any[]) {
    this.server.emit('waitingUpdate', orders);
  }

  emitPendingUpdate(orders: any[]) {
    this.server.emit('pendingUpdate', orders);
  }

  emitCompletedUpdate(orders: any[]) {
    this.server.emit('completedUpdate', orders);
  }
}
