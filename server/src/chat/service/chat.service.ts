import { Injectable } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Chat } from '../../entity/chat.entity';
import { ChatMember } from '../../entity/chat-member.entity';
import { ChatRole, UserRole } from '../../entity/chat-role.entity';
import { User } from '../../entity/user.entity';
import { BlockedUser } from '../../entity/blocked-user.entity';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { CannotAddSelfAsMemberChatException } from '../../exception/cannot-add-self-as-member-chat.exception';
import { UsersNotFoundException } from '../../exception/users-not-found.exception';
import { CannotCreateChatWithBlockedUsers } from '../../exception/cannot-create-chat-with-blocked-users.exception';
import { CannotCreateChatByBlockedUsers } from '../../exception/cannot-create-chat-by-blocked-users.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatNotFoundException } from '../../exception/chat-not-found.exception';
import { UserNotAMemberChatException } from '../../exception/user-not-a-member-chat.exception';
import { CannotChangeSelfChatMemberRoleException } from '../../exception/cannot-change-self-chat-member-role.exception';
import { InsufficientPermissionsChangeChatMemberRoleException } from '../../exception/insufficient-permissions-change-chat-member-role.exception';
import { MemberRoleNotFoundException } from '../../exception/member-role-not-found.exception';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { InsufficientPermissionsUpdateChatException } from '../../exception/insufficient-permissions-update-chat.exception';
import { Message } from '../../entity/message.entity';
import { MessageStatuses } from '../../entity/message-status.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,
    @InjectRepository(ChatRole)
    private readonly chatRoleRepository: Repository<ChatRole>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly dataSource: DataSource,
  ) {}

  private async createChatWithCreator(
    chatName: string,
    creatorId: number,
  ): Promise<Chat> {
    return this.dataSource.transaction(async (manager) => {
      const creator = await manager.findOne(User, { where: { id: creatorId } });
      if (!creator) {
        throw new UserNotFoundException();
      }

      const chat = await manager.create(Chat, { name: chatName });
      const savedChat = await manager.save(chat);

      const creatorRole = await manager.findOne(ChatRole, {
        where: { name: UserRole.OWNER },
      });
      const creatorMember = await manager.create(ChatMember, {
        chat: savedChat,
        user: creator,
        chatRole: creatorRole,
      });
      await manager.save(creatorMember);

      return { ...savedChat, memberIds: [creatorId] };
    });
  }

  async createChatWithMembers(
    chatName: string,
    creatorId: number,
    memberIds: number[],
  ): Promise<Chat> {
    if (!memberIds || memberIds.length === 0)
      return await this.createChatWithCreator(chatName, creatorId);
    return this.dataSource.transaction(async (manager) => {
      const creator = await manager.findOne(User, { where: { id: creatorId } });
      if (!creator) {
        throw new UserNotFoundException();
      }
      memberIds = [...new Set(memberIds)];

      if (memberIds.includes(creatorId)) {
        throw new CannotAddSelfAsMemberChatException();
      }

      const members = await manager.find(User, {
        where: memberIds.map((id) => ({ id })),
      });

      const foundMemberIds = members.map((member) => member.id);
      const missingMemberIds = memberIds.filter(
        (id) => !foundMemberIds.includes(id),
      );

      if (missingMemberIds.length > 0) {
        throw new UsersNotFoundException(missingMemberIds);
      }

      const blockingMembers = await await manager.find(BlockedUser, {
        where: {
          blockedByUser: { id: creatorId },
          blockedUser: { id: In(foundMemberIds) },
        },
        relations: ['blockedUser'],
      });

      if (blockingMembers.length > 0) {
        const blockingMemberIds = blockingMembers.map(
          (blockStatus) => blockStatus.blockedUser.id,
        );
        throw new CannotCreateChatWithBlockedUsers(blockingMemberIds);
      }

      const blockedByMembers = await await manager.find(BlockedUser, {
        where: {
          blockedByUser: { id: In(foundMemberIds) },
          blockedUser: { id: creatorId },
        },
        relations: ['blockedByUser'],
      });

      if (blockedByMembers.length > 0) {
        const blockedMemberIds = blockedByMembers.map(
          (blockStatus) => blockStatus.blockedByUser.id,
        );
        throw new CannotCreateChatByBlockedUsers(blockedMemberIds);
      }

      const chat = await manager.create(Chat, { name: chatName });
      const savedChat = await manager.save(chat);

      const creatorRole = await manager.findOne(ChatRole, {
        where: { name: UserRole.OWNER },
      });
      const creatorMember = await manager.create(ChatMember, {
        chat: savedChat,
        user: creator,
        chatRole: creatorRole,
      });
      await manager.save(creatorMember);

      const userRole = await manager.findOne(ChatRole, {
        where: { name: UserRole.USER },
      });

      const memberEntities = members.map((member) =>
        manager.create(ChatMember, {
          chat: savedChat,
          user: member,
          chatRole: userRole,
        }),
      );

      await manager.save(memberEntities);

      return {
        ...savedChat,
        memberIds: [creatorId, foundMemberIds].flat(2),
      };
    });
  }

  async changeUserRole(
    userId: number,
    changeRoleUserId: number,
    chatId: number,
    newRoleId: number,
  ) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }

    const requestingUser = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['chatRole'],
    });

    if (!requestingUser) {
      throw new UserNotAMemberChatException();
    }

    if (userId === changeRoleUserId) {
      throw new CannotChangeSelfChatMemberRoleException();
    }

    const targetUser = await this.chatMemberRepository.findOne({
      where: { user: { id: changeRoleUserId }, chat: { id: chatId } },
      relations: ['chatRole'],
    });

    if (!targetUser) {
      throw new UserNotAMemberChatException();
    }

    if (
      requestingUser.chatRole.id >= targetUser.chatRole.id ||
      requestingUser.chatRole.id === newRoleId
    ) {
      throw new InsufficientPermissionsChangeChatMemberRoleException();
    }

    const newRole = await this.chatRoleRepository.findOne({
      where: { id: newRoleId },
    });
    if (!newRole) {
      throw new MemberRoleNotFoundException();
    }

    targetUser.chatRole = newRole;
    await this.chatMemberRepository.save(targetUser);
  }

  async updateChat(userId: number, updateChatDto: UpdateChatDto) {
    const chat = await this.chatRepository.findOne({
      where: { id: updateChatDto.chatId },
    });

    if (!chat) {
      throw new ChatNotFoundException();
    }

    const userInChat = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: updateChatDto.chatId } },
      relations: ['chatRole'],
    });

    if (!userInChat) {
      throw new UserNotAMemberChatException();
    }

    const userRole = userInChat.chatRole.name;
    if (![UserRole.ADMIN, UserRole.OWNER].includes(userRole)) {
      throw new InsufficientPermissionsUpdateChatException();
    }

    await this.chatRepository.update(updateChatDto.chatId, {
      name: updateChatDto.name,
      avatar: updateChatDto.avatar,
    });
  }

  async getUserChats(userId: number) {
    const chatMembers = await this.chatMemberRepository.find({
      where: { user: { id: userId } },
      relations: ['chat'],
    });

    const chatDetails = await Promise.all(
      chatMembers.map(async (member) => {
        const chat = member.chat;

        const latestMessage = await this.messageRepository.findOne({
          where: { chat: { id: chat.id } },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepository.count({
          where: {
            chat: { id: chat.id },
            messageStatus: { name: MessageStatuses.SEND },
            user: { id: Not(userId) },
          },
        });

        return {
          id: chat.id,
          name: chat.name,
          avatar: chat.avatar,
          latestMessage: latestMessage?.content || null,
          latestMessageDate: latestMessage?.createdAt || null,
          unreadCount,
        };
      }),
    );

    return chatDetails;
  }
}
