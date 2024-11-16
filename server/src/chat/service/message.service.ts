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
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: number) {
    const { chatId, content } = createMessageDto;

    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }

    const userInChat = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['user'],
    });

    if (!userInChat) {
      throw new UserNotAMemberChatException();
    }

    const messageStatus = await this.messageStatusRepository.findOne({
      where: { name: MessageStatuses.SEND },
    });

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

    const response = {
      id: savedMessage.id,
      chatId: savedMessage.chat.id,
      userId: savedMessage.user.id,
      messageStatus: savedMessage.messageStatus.name,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    };

    await this.messageSocketService.notifyUsersAboutNewMessage(
      response,
      chatMembers,
    );
    return response;
  }

  async markChatMessagesAsRead(chatId: number, userId: number): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }

    const userInChat = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['user'],
    });

    if (!userInChat) {
      throw new UserNotAMemberChatException();
    }

    const messages = await this.messageRepository.find({
      where: {
        chat: { id: chatId },
        user: { id: Not(userId) },
        messageStatus: { name: MessageStatuses.SEND },
      },
      relations: ['messageStatus', 'chat', 'user'],
    });
    if (messages.length === 0) {
      return;
    }
    const messageStatus = await this.messageStatusRepository.findOne({
      where: { name: MessageStatuses.READ },
    });

    for (const message of messages) {
      message.messageStatus = messageStatus;
    }

    const updatedMessages = await this.messageRepository.save(messages);

    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });

    const updatedMessagesResponse = updatedMessages.map((message) => ({
      id: message.id,
      chatId: message.chat.id,
      userId: message.user.id,
      messageStatus: message.messageStatus.name,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    await this.messageSocketService.notifyUsersAboutStatusChange(
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
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }

    const userInChat = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['user'],
    });

    if (!userInChat) {
      throw new UserNotAMemberChatException();
    }

    const [messages, totalMessages] = await this.messageRepository.findAndCount(
      {
        where: { chat: { id: chatId } },
        relations: ['messageStatus', 'chat', 'user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    const messageStatus = await this.messageStatusRepository.findOne({
      where: { name: MessageStatuses.SEND },
    });

    const unreadMessagesForOthers = messages.filter(
      (message) =>
        message.user.id !== userId &&
        message.messageStatus.id === messageStatus.id,
    );
    const allMessagesResponse = messages.map((message) => ({
      id: message.id,
      chatId: message.chat.id,
      userId: message.user.id,
      messageStatus: message.messageStatus.name,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    if (unreadMessagesForOthers.length > 0) {
      const messageStatus = await this.messageStatusRepository.findOne({
        where: { name: MessageStatuses.READ },
      });

      for (const message of unreadMessagesForOthers) {
        message.messageStatus = messageStatus;
      }

      await this.messageRepository.save(unreadMessagesForOthers);

      const chatMembers = await this.chatMemberRepository.find({
        where: { chat: { id: chatId } },
        relations: ['user'],
      });

      const updatedMessagesResponse = unreadMessagesForOthers.map(
        (message) => ({
          id: message.id,
          chatId: message.chat.id,
          userId: message.user.id,
          messageStatus: message.messageStatus.name,
          content: message.content,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        }),
      );

      updatedMessagesResponse.forEach((updatedMessage) => {
        const messageToUpdate = allMessagesResponse.find(
          (message) => message.id === updatedMessage.id,
        );
        if (messageToUpdate) {
          messageToUpdate.messageStatus = updatedMessage.messageStatus;
        }
      });

      await this.messageSocketService.notifyUsersAboutStatusChange(
        updatedMessagesResponse,
        chatMembers,
      );
    }

    return {
      messages: allMessagesResponse,
      totalMessages,
      page,
      limit,
      totalPages: Math.ceil(totalMessages / limit),
    };
  }
}
