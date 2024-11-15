import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { CustomNameAlreadyExistsException } from '../../exception/custom-name-already-exists.exception';
import { BlockedUser } from '../../entity/blocked-user.entity';
import { Contact } from '../../entity/contact.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepository: Repository<BlockedUser>,
    @InjectRepository(Contact)
    private readonly contactedUserRepository: Repository<Contact>,
  ) {}

  private async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async customNameExceptUserExists(
    userId: number,
    customName: string,
  ): Promise<boolean> {
    if (!customName) return false;
    return (
      (await this.userRepository.count({
        where: { customName: customName, id: Not(userId) },
      })) > 0
    );
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    if (
      updateUserDto.customName &&
      (await this.customNameExceptUserExists(userId, updateUserDto.customName))
    ) {
      throw new CustomNameAlreadyExistsException();
    }
    await this.userRepository.update(userId, {
      ...updateUserDto,
      lastActivity: new Date(),
    });
  }

  async getProfileById(requestingUserId: number, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: requestingUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastActivity: true,
        avatarBase64: true,
        customName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }
    const isBlockedByUser = await this.isUserBlockedBy(
      userId,
      requestingUserId,
    );

    const isBlockedByMe = await this.isUserBlockedBy(requestingUserId, userId);
    const isContactedByMe = await this.isUserContactedBy(user.id, userId);
    return { ...user, isBlockedByUser, isBlockedByMe, isContactedByMe };
  }

  async getProfileByCustomName(customName: string, userId: number) {
    if (!customName) {
      throw new UserNotFoundException();
    }

    const user = await this.userRepository.findOne({
      where: { customName: customName },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarBase64: true,
        customName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }
    const isBlockedByUser = await this.isUserBlockedBy(userId, user.id);
    const isBlockedByMe = await this.isUserBlockedBy(user.id, userId);
    const isContactedByMe = await this.isUserContactedBy(user.id, userId);
    return { ...user, isBlockedByUser, isBlockedByMe, isContactedByMe };
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
  private async isUserContactedBy(
    contactedUser: number,
    contactedByUser: number,
  ): Promise<boolean> {
    const isContacted = await this.contactedUserRepository.findOne({
      where: {
        contactedUser: { id: contactedUser },
        contactedByUser: { id: contactedByUser },
      },
    });
    return !!isContacted;
  }
}
