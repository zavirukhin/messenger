import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedUser } from '../../entity/blocked-user.entity';
import { User } from '../../entity/user.entity';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { UserAlreadyBlockedException } from '../../exception/user-already-blocked.exception';
import { BlockNotFoundException } from '../../exception/block-not-found.exception';
import { CannotBlockSelfException } from '../../exception/cannot-block-self.exception';

@Injectable()
export class BlockedUserService {
  constructor(
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepository: Repository<BlockedUser>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async isUserAlreadyBlocked(
    blockedUserId: number,
    blockedByUserId: number,
  ): Promise<boolean> {
    const existingBlock = await this.blockedUserRepository.findOne({
      where: {
        blockedUser: { id: blockedUserId },
        blockedByUser: { id: blockedByUserId },
      },
    });
    return !!existingBlock;
  }

  private async createBlockedUserRecord(
    blockedUser: User,
    blockedByUser: User,
  ): Promise<BlockedUser> {
    const blockedUserRecord = this.blockedUserRepository.create({
      blockedUser,
      blockedByUser,
    });
    return await this.blockedUserRepository.save(blockedUserRecord);
  }

  async blockUser(
    blockedUserId: number,
    blockedByUserId: number,
  ): Promise<void> {
    if (blockedUserId === blockedByUserId) {
      throw new CannotBlockSelfException();
    }
    const blockedUser = await this.findUserById(blockedUserId);
    const blockedByUser = await this.findUserById(blockedByUserId);

    const isBlocked = await this.isUserAlreadyBlocked(
      blockedUserId,
      blockedByUserId,
    );
    if (isBlocked) {
      throw new UserAlreadyBlockedException();
    }

    await this.createBlockedUserRecord(blockedUser, blockedByUser);
  }

  async unblockUser(
    blockedUserId: number,
    blockedByUserId: number,
  ): Promise<void> {
    const existingBlock = await this.blockedUserRepository.findOne({
      where: {
        blockedUser: { id: blockedUserId },
        blockedByUser: { id: blockedByUserId },
      },
    });

    if (!existingBlock) {
      throw new BlockNotFoundException();
    }

    await this.blockedUserRepository.remove(existingBlock);
  }

  async getBlockedUsers(userId: number): Promise<User[]> {
    const blockedUsers = await this.blockedUserRepository.find({
      where: { blockedByUser: { id: userId } },
      relations: ['blockedUser'],
      select: {
        blockedUser: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          customName: true,
        },
      },
    });

    return blockedUsers.map((blockedUser) => blockedUser.blockedUser);
  }
}
