import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessageSocketService } from '../service/message-socket.service';

@WebSocketGateway({cors: { origin: process.env.SOCKET_ALLOWED_ORIGINS || '*' }})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageSocketService: MessageSocketService) {}

  async handleConnection(socket: Socket) {
    const isValid = await this.messageSocketService.verifyToken(socket);

    if (isValid) {
      const user = socket.data.user;
      this.messageSocketService.addClient(user.id.toString(), socket);
    } else {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      this.messageSocketService.removeClient(user.id.toString(), socket);
    }
  }
}
