import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
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
import { InsufficientPermissionsDeleteUserFromChatException } from '../../exception/insufficient-permissions-delete-user-from-chat.exception';
import { MessageSocketService } from './message-socket.service';
import { UserAlreadyInChatException } from '../../exception/user-already-in-chat.exception';
import { InsufficientPermissionsAddUserToChatException } from '../../exception/insufficient-permissions-add-user-to-chat.exception';
import { CannotRemoveSelfFromChatException } from 'src/exception/cannot-remove-self-from-chat.exception';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,
    @InjectRepository(ChatRole)
    private readonly chatRoleRepository: Repository<ChatRole>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly messageSocketService: MessageSocketService,
    private readonly dataSource: DataSource,
  ) {}

  async createChatWithCreator(
    chatName: string,
    creatorId: number,
  ): Promise<Chat> {
    const creator = await this.findUserByIdOrFail(creatorId);

    return this.dataSource.transaction(async (manager) => {
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
    if (!memberIds || memberIds.length === 0) {
      return await this.createChatWithCreator(chatName, creatorId);
    }

    memberIds = [...new Set(memberIds)];

    if (memberIds.includes(creatorId)) {
      throw new CannotAddSelfAsMemberChatException();
    }

    const creator = await this.findUserByIdOrFail(creatorId);

    return this.dataSource.transaction(async (manager) => {
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

      const { blockingMembers, blockedByMembers } =
        await this.getBlockedUsersForChat(creatorId, foundMemberIds, manager);

      if (blockingMembers.length > 0) {
        throw new CannotCreateChatWithBlockedUsers(blockingMembers);
      }

      if (blockedByMembers.length > 0) {
        throw new CannotCreateChatByBlockedUsers(blockedByMembers);
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
      await this.messageSocketService.notifyUsersAboutNewChat(savedChat, [
        creatorMember,
        ...memberEntities,
      ]);
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
    const chat = await this.findChatByIdOrFail(chatId);

    const requestingUser = await this.getChatMemberOrFail(userId, chatId);
    if (userId === changeRoleUserId) {
      throw new CannotChangeSelfChatMemberRoleException();
    }

    const targetUser = await this.getChatMemberOrFail(
      changeRoleUserId,
      chat.id,
    );

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
    const chat = await this.findChatByIdOrFail(updateChatDto.chatId);

    const userInChat = await this.getChatMemberOrFail(userId, chat.id);

    if (
      !this.hasPermission(userInChat.chatRole.name, [
        UserRole.ADMIN,
        UserRole.OWNER,
      ])
    ) {
      throw new InsufficientPermissionsUpdateChatException();
    }

    await this.chatRepository.update(updateChatDto.chatId, {
      name: updateChatDto.name,
      avatar: updateChatDto.avatar,
    });

    const chatMembers = await this.getChatMembers(userId, updateChatDto.chatId);
    this.messageSocketService.notifyUsersAboutChatUpdate(chat, chatMembers);
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

  async addMemberToChat(userId: number, newMemberId: number, chatId: number) {
    const chat = await this.findChatByIdOrFail(chatId);
    const requestingUser = await this.getChatMemberOrFail(userId, chatId);

    if (
      !this.hasPermission(requestingUser.chatRole.name, [
        UserRole.ADMIN,
        UserRole.OWNER,
      ])
    ) {
      throw new InsufficientPermissionsAddUserToChatException();
    }

    const newUser = await this.findUserByIdOrFail(newMemberId);
    const existingMember = await this.chatMemberRepository.findOne({
      where: { user: { id: newMemberId }, chat: { id: chatId } },
    });
    if (existingMember) {
      throw new UserAlreadyInChatException();
    }
    const role = await this.chatRoleRepository.findOne({
      where: { name: UserRole.USER },
    });
    if (!role) {
      throw new MemberRoleNotFoundException();
    }

    const newChatMember = this.chatMemberRepository.create({
      user: newUser,
      chat: chat,
      chatRole: role,
    });
    await this.chatMemberRepository.save(newChatMember);
    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });
    this.messageSocketService.notifyUsersAboutUserAddition(
      newUser,
      chatId,
      chatMembers,
    );
  }

  async removeMemberFromChat(
    userId: number,
    memberIdToRemove: number,
    chatId: number,
  ) {
    const chat = await this.findChatByIdOrFail(chatId);
    const requestingUser = await this.getChatMemberOrFail(userId, chat.id);

    if (!this.hasPermission(requestingUser.chatRole.name, [UserRole.OWNER])) {
      throw new InsufficientPermissionsDeleteUserFromChatException();
    }

    const memberToRemove = await this.getChatMemberOrFail(
      memberIdToRemove,
      chatId,
    );

    if (userId === memberIdToRemove) {
      throw new CannotRemoveSelfFromChatException();
    }
    await this.chatMemberRepository.remove(memberToRemove);
    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user'],
    });
    this.messageSocketService.notifyUsersAboutUserRemoval(
      memberIdToRemove,
      chatId,
      chatMembers,
    );
  }

  private async findUserByIdOrFail(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async findChatByIdOrFail(chatId: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }
    return chat;
  }

  private async getChatMemberOrFail(
    userId: number,
    chatId: number,
  ): Promise<ChatMember> {
    const chatMember = await this.chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['chatRole'],
    });
    if (!chatMember) {
      throw new UserNotAMemberChatException();
    }
    return chatMember;
  }

  private hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  private async getBlockedUsersForChat(
    creatorId: number,
    memberIds: number[],
    manager: EntityManager,
  ) {
    const blockingMembers = await manager.find(BlockedUser, {
      where: {
        blockedByUser: { id: creatorId },
        blockedUser: { id: In(memberIds) },
      },
      relations: ['blockedUser'],
    });

    const blockedByMembers = await manager.find(BlockedUser, {
      where: {
        blockedByUser: { id: In(memberIds) },
        blockedUser: { id: creatorId },
      },
      relations: ['blockedByUser'],
    });

    return {
      blockingMembers: blockingMembers.map(
        (blockStatus) => blockStatus.blockedUser.id,
      ),
      blockedByMembers: blockedByMembers.map(
        (blockStatus) => blockStatus.blockedByUser.id,
      ),
    };
  }

  async getChatMembers(userId: number, chatId: number): Promise<any[]> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });
    if (!chat) {
      throw new ChatNotFoundException();
    }

    const isMember = await this.chatMemberRepository.findOne({
      where: { chat: { id: chatId }, user: { id: userId } },
    });
    if (!isMember) {
      throw new UserNotAMemberChatException();
    }

    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user', 'chatRole'],
    });

    return chatMembers.map((member) => {
      return {
        id: member.id,
        user: {
          id: member.user.id,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          lastActivity: member.user.lastActivity,
          avatar: member.user.avatar,
          customName: member.user.customName,
        },
        chatRole: member.chatRole.name,
      };
    });
  }
}
