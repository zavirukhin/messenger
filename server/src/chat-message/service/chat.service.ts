import { Injectable } from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { Chat } from '../../entity/chat.entity';
import { ChatMember } from '../../entity/chat-member.entity';
import { ChatRole, UserRole } from '../../entity/chat-role.entity';
import { User } from '../../entity/user.entity';
import { CannotAddSelfAsMemberChatException } from '../../exception/cannot-add-self-as-member-chat.exception';
import { UsersNotFoundException } from '../../exception/users-not-found.exception';
import { InjectRepository } from '@nestjs/typeorm';
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
import { ChatUtils } from '../utils/chat.utils';
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
    const creator = await ChatUtils.findUserByIdOrFail(
      creatorId,
      this.userRepository,
    );

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
    if (memberIds?.includes(creatorId))
      throw new CannotAddSelfAsMemberChatException();
    if (!memberIds?.length)
      return this.createChatWithCreator(chatName, creatorId);

    const creator = await ChatUtils.findUserByIdOrFail(
      creatorId,
      this.userRepository,
    );

    return this.dataSource.transaction(async (manager) => {
      const members = await ChatUtils.getMembersByIds(manager, memberIds);
      const missingMemberIds = ChatUtils.getMissingMemberIds(
        memberIds,
        members,
      );

      if (missingMemberIds.length)
        throw new UsersNotFoundException(missingMemberIds);

      await ChatUtils.checkBlockedUsers(creatorId, memberIds, manager);

      const chat = await ChatUtils.createChat(manager, chatName);

      const [creatorRole, userRole] = await ChatUtils.getChatRoles(manager);

      const creatorMember = await ChatUtils.createChatMember(
        manager,
        chat,
        creator,
        creatorRole,
      );

      const memberEntities = await ChatUtils.saveChatMembers(
        manager,
        members,
        chat,
        userRole,
      );

      await this.messageSocketService.notifyUsersAboutNewChat(chat, [
        creatorMember,
        ...memberEntities,
      ]);

      return {
        ...chat,
        memberIds: [creatorId, ...members.map((m) => m.id)],
      };
    });
  }

  async changeUserRole(
    userId: number,
    changeRoleUserId: number,
    chatId: number,
    newRoleId: number,
  ) {
    const chat = await ChatUtils.findChatByIdOrFail(
      chatId,
      this.chatRepository,
    );

    const requestingUser = await ChatUtils.getChatMemberOrFail(
      userId,
      chatId,
      this.chatMemberRepository,
    );
    if (userId === changeRoleUserId) {
      throw new CannotChangeSelfChatMemberRoleException();
    }

    const targetUser = await ChatUtils.getChatMemberOrFail(
      changeRoleUserId,
      chat.id,
      this.chatMemberRepository,
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
    const chat = await ChatUtils.findChatByIdOrFail(
      updateChatDto.chatId,
      this.chatRepository,
    );

    const userInChat = await ChatUtils.getChatMemberOrFail(
      userId,
      chat.id,
      this.chatMemberRepository,
    );

    if (
      !ChatUtils.hasPermission(userInChat.chatRole.name, [
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
    const updatedChat = await this.chatRepository.findOne({
      where: { id: chat.id },
    });
    const chatMembers = await this.getChatMembers(userId, updateChatDto.chatId);
    this.messageSocketService.notifyUsersAboutChatUpdate(
      updatedChat,
      chatMembers,
    );
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

  async getChat(userId: number, chatId: number) {
    const chat = await ChatUtils.findChatByIdOrFail(
      chatId,
      this.chatRepository,
    );

    await ChatUtils.getChatMemberOrFail(
      userId,
      chatId,
      this.chatMemberRepository,
    );

    return chat;
  }

  async addMemberToChat(userId: number, newMemberId: number, chatId: number) {
    const chat = await ChatUtils.findChatByIdOrFail(
      chatId,
      this.chatRepository,
    );
    const requestingUser = await ChatUtils.getChatMemberOrFail(
      userId,
      chatId,
      this.chatMemberRepository,
    );

    if (
      !ChatUtils.hasPermission(requestingUser.chatRole.name, [
        UserRole.ADMIN,
        UserRole.OWNER,
      ])
    ) {
      throw new InsufficientPermissionsAddUserToChatException();
    }

    const newUser = await ChatUtils.findUserByIdOrFail(
      newMemberId,
      this.userRepository,
    );
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
    const chat = await ChatUtils.findChatByIdOrFail(
      chatId,
      this.chatRepository,
    );
    const requestingUser = await ChatUtils.getChatMemberOrFail(
      userId,
      chat.id,
      this.chatMemberRepository,
    );

    if (
      !ChatUtils.hasPermission(requestingUser.chatRole.name, [UserRole.OWNER])
    ) {
      throw new InsufficientPermissionsDeleteUserFromChatException();
    }

    const memberToRemove = await ChatUtils.getChatMemberOrFail(
      memberIdToRemove,
      chatId,
      this.chatMemberRepository,
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

  async getChatMembers(userId: number, chatId: number) {
    await ChatUtils.findChatByIdOrFail(chatId, this.chatRepository);
    await ChatUtils.getChatMemberOrFail(
      userId,
      chatId,
      this.chatMemberRepository,
    );

    const chatMembers = await this.chatMemberRepository.find({
      where: { chat: { id: chatId } },
      relations: ['user', 'chatRole'],
    });

    return ChatUtils.transformChatMembers(chatMembers);
  }
}
