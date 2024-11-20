import { ChatMember } from 'src/entity/chat-member.entity';
import { BlockedUser } from '../../entity/blocked-user.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { UserNotAMemberChatException } from '../../exception/user-not-a-member-chat.exception';
import { Chat } from '../../entity/chat.entity';
import { ChatNotFoundException } from '../../exception/chat-not-found.exception';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { User } from '../../entity/user.entity';
import { ChatRole, UserRole } from '../../entity/chat-role.entity';
import { CannotCreateChatByBlockedUsers } from '../../exception/cannot-create-chat-by-blocked-users.exception';
import { CannotCreateChatWithBlockedUsers } from '../../exception/cannot-create-chat-with-blocked-users.exception';

export class ChatUtils {
  static transformChatMembers(chatMembers) {
    return chatMembers.map((member) => ({
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
    }));
  }
  static async getBlockedUsersForChat(
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
  static hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }
  static async findUserByIdOrFail(
    userId: number,
    userRepository: Repository<User>,
  ): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }
  static async findChatByIdOrFail(
    chatId: number,
    chatRepository: Repository<Chat>,
  ): Promise<Chat> {
    const chat = await chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new ChatNotFoundException();
    }
    return chat;
  }
  static async getChatMemberOrFail(
    userId: number,
    chatId: number,
    chatMemberRepository: Repository<ChatMember>,
  ): Promise<ChatMember> {
    const chatMember = await chatMemberRepository.findOne({
      where: { user: { id: userId }, chat: { id: chatId } },
      relations: ['chatRole'],
    });
    if (!chatMember) {
      throw new UserNotAMemberChatException();
    }
    return chatMember;
  }

  static async getMembersByIds(manager: EntityManager, memberIds: number[]) {
    return manager.find(User, { where: { id: In(memberIds) } });
  }

  static getMissingMemberIds(memberIds: number[], members: User[]): number[] {
    return memberIds.filter((id) => !members.some((m) => m.id === id));
  }

  static async checkBlockedUsers(
    creatorId: number,
    memberIds: number[],
    manager: EntityManager,
  ) {
    const { blockingMembers, blockedByMembers } =
      await this.getBlockedUsersForChat(creatorId, memberIds, manager);

    if (blockingMembers.length) {
      throw new CannotCreateChatWithBlockedUsers(blockingMembers);
    }

    if (blockedByMembers.length) {
      throw new CannotCreateChatByBlockedUsers(blockedByMembers);
    }
  }

  static async getChatRoles(
    manager: EntityManager,
  ): Promise<[ChatRole, ChatRole]> {
    return Promise.all([
      manager.findOne(ChatRole, { where: { name: UserRole.OWNER } }),
      manager.findOne(ChatRole, { where: { name: UserRole.USER } }),
    ]);
  }

  static async saveChatMembers(
    manager: EntityManager,
    members: User[],
    chat: Chat,
    userRole: ChatRole,
  ) {
    return manager.save(
      members.map((member) =>
        manager.create(ChatMember, {
          chat,
          user: member,
          chatRole: userRole,
        }),
      ),
    );
  }

  static async createChat(manager: EntityManager, chatName: string) {
    const chat = manager.create(Chat, { name: chatName });
    return manager.save(chat);
  }

  static async createChatMember(
    manager: EntityManager,
    chat: Chat,
    user: User,
    role: ChatRole,
  ) {
    const chatMember = manager.create(ChatMember, {
      chat,
      user,
      chatRole: role,
    });
    return manager.save(chatMember);
  }
}
