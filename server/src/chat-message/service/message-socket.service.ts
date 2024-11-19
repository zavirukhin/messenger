import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatMember } from '../../entity/chat-member.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';

@Injectable()
export class MessageSocketService {
  constructor(private readonly jwtService: MyJwtService) {}
  private clients: Map<string, Socket[]> = new Map();

  addClient(userId: string, socket: Socket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)?.push(socket);
  }

  removeClient(userId: string, socket: Socket) {
    const userSockets = this.clients.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socket);
      if (index !== -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  getClients(userId: string): Socket[] | undefined {
    return this.clients.get(userId);
  }

  async verifyToken(socket: Socket): Promise<boolean> {
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

  private isClientMemberOfChat(
    userId: string,
    chatMembers: ChatMember[],
  ): boolean {
    return chatMembers.some((member) => member.user.id.toString() === userId);
  }

  async notifyUsersAboutNewMessage(message, chatMembers: ChatMember[]) {
    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onNewMessage', message);
          }
        }
      }
    }
  }

  async notifyUsersAboutNewChat(chat, chatMembers: ChatMember[]) {
    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onNewChat', {
              ...chat,
              memberIds: chatMembers.map((member) => member.user.id),
            });
          }
        }
      }
    }
  }

  async notifyUsersAboutStatusMessagesChange(
    updatedMessages,
    chatMembers: ChatMember[],
  ) {
    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onStatusMessagesChange', updatedMessages);
          }
        }
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

    const socketsToRemove = this.getClients(userIdToRemove.toString());
    if (socketsToRemove) {
      for (const socket of socketsToRemove) {
        if (await this.verifyToken(socket)) {
          socket.emit('onUserRemovedFromChat', notificationMessage);
        }
      }
    }

    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onUserRemovedFromChat', notificationMessage);
          }
        }
      }
    }
  }

  async notifyUsersAboutUserAddition(
    user,
    chatId: number,
    chatMembers: ChatMember[],
  ) {
    const notificationMessage = {
      type: 'user_added',
      chatId: chatId,
      user,
    };

    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onUserAddedToChat', notificationMessage);
          }
        }
      }
    }
  }

  async notifyUsersAboutChatUpdate(chat, chatMembers: ChatMember[]) {
    for (const [userId, sockets] of this.clients) {
      if (this.isClientMemberOfChat(userId, chatMembers)) {
        for (const socket of sockets) {
          if (await this.verifyToken(socket)) {
            socket.emit('onChatUpdated', chat);
          }
        }
      }
    }
  }
}
