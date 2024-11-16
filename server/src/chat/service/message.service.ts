import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      where: { name: MessageStatuses.SENT },
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
      messageStatusId: savedMessage.messageStatus.id,
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
}
