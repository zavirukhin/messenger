import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Message } from '../../entity/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Chat } from '../../entity/chat.entity';
import {
  MessageStatus,
  MessageStatuses,
} from '../../entity/message-status.entity';
import { ChatNotFoundException } from '../../exception/chat-not-found.exception';
import { UserNotAMemberChatException } from '../../exception/user-not-a-member-chat.exception';
import { ChatMember } from '../../entity/chat-member.entity';
import { MessageSocketService } from './message-socket.service';
import { MetricsService } from '../../metrics/service/metrics.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,

    @InjectRepository(MessageStatus)
    private readonly messageStatusRepository: Repository<MessageStatus>,

    private readonly messageSocketService: MessageSocketService,
    private readonly metricsService: MetricsService,
  ) {}

  private async findChatById(chatId: number) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }
    return chat;
  }

  private async findUserInChat(chatId: number, userId: number) {
    const userInChat = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['user'],
    });
    if (!userInChat) {
      throw new UserNotAMemberChatException();
    }
    return userInChat;
  }

  private async findMessageStatusByName(statusName: MessageStatuses) {
    return this.messageStatusRepository.findOne({
      where: { name: statusName },
    });
  }

  private mapMessageToResponse(message: Message) {
    return {
      id: message.id,
      chatId: message.chat.id,
      userAvatar: message.user.avatar,
      firstName: message.user.firstName,
      lastName: message.user.lastName,
      userId: message.user.id,
      messageStatus: message.messageStatus.name,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  async createMessage(createMessageDto: CreateMessageDto, userId: number) {
    const startTime = Date.now();
    const { chatId, content } = createMessageDto;

    const chat = await this.findChatById(chatId);
    const userInChat = await this.findUserInChat(chatId, userId);
    const messageStatus = await this.findMessageStatusByName(
      MessageStatuses.SEND,
    );

    const message = this.messageRepository.create({
      chat,
      user: userInChat.user,
      messageStatus,
      content,
    });

    const savedMessage = await this.messageRepository.save(message);
    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });

    const response = this.mapMessageToResponse(savedMessage);
    await this.messageSocketService.notifyUsersAboutNewMessage(
      response,
      chatMembers,
    );
    this.metricsService.incrementMessagesSent(chatId.toString());
    this.metricsService.observeMessageSendDuration(
      chatId.toString(),
      (Date.now() - startTime) / 1000,
    );
    return response;
  }

  async markChatMessagesAsRead(chatId: number, userId: number): Promise<void> {
    const chat = await this.findChatById(chatId);
    await this.findUserInChat(chat.id, userId);

    const messageStatus = await this.findMessageStatusByName(
      MessageStatuses.READ,
    );
    const messages = await this.messageRepository.find({
      where: {
        chat: { id: chatId },
        user: { id: Not(userId) },
        messageStatus: { name: MessageStatuses.SEND },
      },
      relations: ['messageStatus', 'chat', 'user'],
    });

    if (messages.length === 0) return;

    messages.forEach((message) => {
      message.messageStatus = messageStatus;
    });

    const updatedMessages = await this.messageRepository.save(messages);
    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });

    const updatedMessagesResponse = updatedMessages.map(
      this.mapMessageToResponse,
    );
    await this.messageSocketService.notifyUsersAboutStatusMessagesChange(
      updatedMessagesResponse,
      chatMembers,
    );
  }

  async getChatHistory(
    chatId: number,
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const startTime = Date.now();
    const chat = await this.findChatById(chatId);
    await this.findUserInChat(chat.id, userId);

    const [messages, totalMessages] = await this.messageRepository.findAndCount(
      {
        where: { chat: { id: chatId } },
        relations: ['messageStatus', 'chat', 'user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const messageStatus = await this.findMessageStatusByName(
      MessageStatuses.SEND,
    );
    const unreadMessagesForOthers = messages.filter(
      (message) =>
        message.user.id !== userId &&
        message.messageStatus.id === messageStatus.id,
    );

    const allMessagesResponse = messages.map(this.mapMessageToResponse);

    if (unreadMessagesForOthers.length > 0) {
      const readStatus = await this.findMessageStatusByName(
        MessageStatuses.READ,
      );
      unreadMessagesForOthers.forEach((message) => {
        message.messageStatus = readStatus;
      });

      await this.messageRepository.save(unreadMessagesForOthers);

      const chatMembers = await this.chatMemberRepository.find({
        where: { chat: { id: chatId } },
        relations: ['user'],
      });

      const updatedMessagesResponse = unreadMessagesForOthers.map(
        this.mapMessageToResponse,
      );
      updatedMessagesResponse.forEach((updatedMessage) => {
        const messageToUpdate = allMessagesResponse.find(
          (message) => message.id === updatedMessage.id,
        );
        if (messageToUpdate) {
          messageToUpdate.messageStatus = updatedMessage.messageStatus;
        }
      });

      await this.messageSocketService.notifyUsersAboutStatusMessagesChange(
        updatedMessagesResponse,
        chatMembers,
      );
    }
    this.metricsService.observeMessageHistoryRequestDuration(
      chatId.toString(),
      (Date.now() - startTime) / 1000,
    );
    return {
      messages: allMessagesResponse,
      totalMessages,
      page,
      limit,
      totalPages: Math.ceil(totalMessages / limit),
    };
  }
}
