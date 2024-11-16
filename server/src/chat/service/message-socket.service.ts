import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatMember } from '../../entity/chat-member.entity';
@Injectable()
export class MessageSocketService {
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

  async notifyUsersAboutNewMessage(message, chatMembers: ChatMember[]) {
    chatMembers.forEach((member) => {
      const socket = this.getClient(member.user.id.toString());
      if (socket) {
        socket.emit('newMessage', message);
      }
    });
  }
}
