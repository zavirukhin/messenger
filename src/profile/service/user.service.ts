import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { CustomNameAlreadyExistsException } from '../../exception/custom-name-already-exists.exception';
import { UserUpdateException } from '../../exception/user-update.exception';
import { NoChangesDetectedException } from '../../exception/no-changes-detection.exception';
import { UserDeleteException } from '../../exception/user-delete.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UserNotFoundException();
    }

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

    const result = await this.userRepository.update(userId, {
      ...updateUserDto,
      last_activity: new Date(),
    });

    if (result.affected === 0) {
      throw new UserUpdateException();
    }
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UserNotFoundException();
    }

    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new UserDeleteException();
    }
  }

  async updateLastActivityUser(userId: number) {
    const result = await this.userRepository.update(userId, {
      last_activity: new Date(),
    });

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }
  }

  private async customNameExists(customName: string): Promise<boolean> {
    if (!customName) return false;
    return (
      (await this.userRepository.count({
        where: { custom_name: customName },
      })) > 0
    );
  }
}
