import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { CustomNameAlreadyExistsException } from '../../exception/custom-name-already-exists.exception';
import { NoChangesDetectedException } from '../../exception/no-changes-detection.exception';
import { BlockedUser } from '../../entity/blocked-user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepository: Repository<BlockedUser>,
  ) {}

  private async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async customNameExists(customName: string): Promise<boolean> {
    if (!customName) return false;
    return (
      (await this.userRepository.count({
        where: { custom_name: customName },
      })) > 0
    );
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(userId);

    if (JSON.stringify(updateUserDto) === JSON.stringify(user)) {
      throw new NoChangesDetectedException();
    }

    if (
      updateUserDto.custom_name &&
      (await this.customNameExists(updateUserDto.custom_name))
    ) {
      throw new CustomNameAlreadyExistsException();
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.update(userId, {
      ...updateUserDto,
      last_activity: new Date(),
    });
  }

  async deleteUser(userId: number) {
    const user = await this.findUserById(userId);
    await this.userRepository.delete(user.id);
  }

  async getProfileById(requestingUserId: number, targetUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: requestingUserId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        last_activity: true,
        avatar_base64: true,
        custom_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }
    const isBlockedByUser = await this.isUserBlockedBy(
      targetUserId,
      requestingUserId,
    );

    return { ...user, isBlockedByUser };
  }

  async getProfileByCustomName(customName: string, targetUserId: number) {
    if (!customName) {
      throw new UserNotFoundException();
    }

    const user = await this.userRepository.findOne({
      where: { custom_name: customName },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        avatar_base64: true,
        custom_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }
    const isBlockedByUser = await this.isUserBlockedBy(targetUserId, user.id);

    return { ...user, isBlockedByUser };
  }

  private async isUserBlockedBy(
    blockedUser: number,
    blockedByUser: number,
  ): Promise<boolean> {
    const isBlocked = await this.blockedUserRepository.findOne({
      where: {
        blockedUser: { id: blockedUser },
        blockedByUser: { id: blockedByUser },
      },
    });
    return !!isBlocked;
  }
}
