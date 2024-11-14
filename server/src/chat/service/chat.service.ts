import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Chat } from '../../entity/chat.entity';
import { ChatMember } from '../../entity/chat-member.entity';
import { ChatRole, UserRole } from '../../entity/chat-role.entity';
import { User } from '../../entity/user.entity';
import { BlockedUser } from '../../entity/blocked-user.entity';

@Injectable()
export class ChatService {
  constructor(private readonly dataSource: DataSource) {}

  private async createChatWithCreator(
    chatName: string,
    creatorId: number,
  ): Promise<Chat> {
    return this.dataSource.transaction(async (manager) => {
      const creator = await manager.findOne(User, { where: { id: creatorId } });
      if (!creator) {
        throw new NotFoundException(`Creator with ID ${creatorId} not found`);
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

      return savedChat;
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
        throw new NotFoundException(`Creator with ID ${creatorId} not found`);
      }
      memberIds = [...new Set(memberIds)];

      if (memberIds.includes(creatorId)) {
        throw new ConflictException('Cannot add self two times');
      }

      const members = await manager.find(User, {
        where: memberIds.map((id) => ({ id })),
      });

      const foundMemberIds = members.map((member) => member.id);
      const missingMemberIds = memberIds.filter(
        (id) => !foundMemberIds.includes(id),
      );

      if (missingMemberIds.length > 0) {
        throw new NotFoundException(
          `Members with IDs ${missingMemberIds.join(', ')} not found`,
        );
      }

      // Проверка, заблокировал ли текущий пользователь других участников
      const blockingMembers = await await manager.find(BlockedUser, {
        where: {
          blockedByUser: { id: creatorId }, // Текущий пользователь заблокировал кого-то
          blockedUser: { id: In(foundMemberIds) }, // Кто-то из участников чата
        },
        relations: ['blockedUser'],
      });

      if (blockingMembers.length > 0) {
        const blockingMemberIds = blockingMembers.map(
          (blockStatus) => blockStatus.blockedUser.id,
        );
        throw new ConflictException(
          `You have blocked members with IDs: ${blockingMemberIds.join(', ')}`,
        );
      }

      // Проверка, заблокирован ли текущий пользователь другими участниками
      const blockedByMembers = await await manager.find(BlockedUser, {
        where: {
          blockedByUser: { id: In(foundMemberIds) }, // Кто-то из участников чата заблокировал текущего пользователя
          blockedUser: { id: creatorId }, // Текущий пользователь заблокирован
        },
        relations: ['blockedByUser'],
      });

      if (blockedByMembers.length > 0) {
        const blockedMemberIds = blockedByMembers.map(
          (blockStatus) => blockStatus.blockedByUser.id,
        );
        throw new ConflictException(
          `You are blocked by members with IDs: ${blockedMemberIds.join(', ')}`,
        );
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

      return savedChat;
    });
  }
}
