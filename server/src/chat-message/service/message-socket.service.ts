import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatMember } from '../../entity/chat-member.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';
@Injectable()
export class MessageSocketService {
  constructor(private readonly jwtService: MyJwtService) {}
  private clients: Map<string, Socket> = new Map();

  addClient(userId: string, socket: Socket) {
    this.clients.set(userId, socket);
  }

  removeClient(userId: string) {
    this.clients.delete(userId);
  }

  getClient(userId: string): Socket | undefined {
    return this.clients.get(userId);
  }

  private async verifyToken(socket: Socket): Promise<boolean> {
    const authHeader = socket.handshake.headers.authorization;

    if (typeof authHeader === 'string') {
      const token = authHeader.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return false;
      }

      try {
        const user = await this.jwtService.verifyToken(token);
        socket.data.user = user;
        return true;
      } catch {
        socket.disconnect();
        return false;
      }
    }

    socket.disconnect();
    return false;
  }

  async notifyUsersAboutNewMessage(message, chatMembers: ChatMember[]) {
    for (const member of chatMembers) {
      const socket = this.getClient(member.user.id.toString());
      if (socket && (await this.verifyToken(socket))) {
        socket.emit('onNewMessage', message);
      }
    }
  }

  async notifyUsersAboutNewChat(chat, chatMembers: ChatMember[]) {
    for (const member of chatMembers) {
      const socket = this.getClient(member.user.id.toString());
      if (socket && (await this.verifyToken(socket))) {
        socket.emit('onNewChat', {
          ...chat,
          memberIds: chatMembers.map((member) => member.user.id),
        });
      }
    }
  }

  async notifyUsersAboutStatusMessagesChange(
    updatedMessages,
    chatMembers: ChatMember[],
  ) {
    for (const member of chatMembers) {
      const socket = this.getClient(member.user.id.toString());
      if (socket && (await this.verifyToken(socket))) {
        socket.emit('onStatusMessagesChange', updatedMessages);
      }
    }
  }

  async notifyUsersAboutUserRemoval(
    userIdToRemove: number,
    chatId: number,
    chatMembers: ChatMember[],
  ) {
    const notificationMessage = {
      type: 'user_removed',
      chatId: chatId,
      userId: userIdToRemove,
    };

    for (const member of chatMembers) {
      const socket = this.getClient(member.user.id.toString());
      if (socket && (await this.verifyToken(socket))) {
        socket.emit('onUserRemovedFromChat', notificationMessage);
      }
    }
  }

  async notifyUsersAboutUserAddition(
    userIdAdded: number,
    chatId: number,
    chatMembers: ChatMember[],
  ) {
    const notificationMessage = {
      type: 'user_added',
      chatId: chatId,
      userId: userIdAdded,
    };

    for (const member of chatMembers) {
      const socket = this.getClient(member.user.id.toString());
      if (socket && (await this.verifyToken(socket))) {
        socket.emit('onUserAddedToChat', notificationMessage);
      }
    }
  }
}
