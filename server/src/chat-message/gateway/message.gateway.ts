import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageSocketService } from '../service/message-socket.service';
import { MyJwtService } from '../../jwt/service/jwt.service';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;

  constructor(
    private readonly messageSocketService: MessageSocketService,
    private readonly jwtService: MyJwtService,
  ) {}

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization;

    if (typeof authHeader === 'string') {
      const token = authHeader.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      try {
        const user = await this.jwtService.verifyToken(token);
        this.messageSocketService.addClient(user.id.toString(), socket);
      } catch {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.messageSocketService.removeClient(socket.id);
  }
}
