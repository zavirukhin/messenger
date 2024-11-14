import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { UserAlreadyExistsException } from '../../exception/user-already-exists.exception';
import { CodeService } from './code.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: MyJwtService,
    private readonly codeService: CodeService,
  ) {}

  async sendCode(phone: string) {
    return this.codeService.sendCode(phone);
  }

  async validateCode(phone: string, code: string) {
    await this.codeService.validateCode(phone, code, false);
    const user = await this.findUserByPhone(phone);
    this.codeService.deleteCode(phone);
    return { token: await this.jwtService.generateToken(user.id) };
  }

  async create(
    phone: string,
    code: string,
    firstName: string,
    lastName: string,
  ): Promise<{ token: string }> {
    await this.codeService.validateCode(phone, code, false);

    if (await this.userExists(phone)) {
      throw new UserAlreadyExistsException();
    }
    this.codeService.deleteCode(phone);

    const newUser = await this.createUser(phone, firstName, lastName);
    const token = await this.jwtService.generateToken(newUser.id);
    return { token };
  }

  private async findUserByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async userExists(phone: string): Promise<boolean> {
    return (await this.userRepository.count({ where: { phone } })) > 0;
  }

  private async createUser(
    phone: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    return this.userRepository.save({
      phone,
      firstName,
      lastName,
      lastActivity: new Date(),
    });
  }
}
