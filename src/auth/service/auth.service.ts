import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { UserAlreadyExistsException } from '../exception/user-already-exists.exception';
import { InvalidTokenException } from '../exception/invalid-token.exception';
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
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UserNotFoundException();
    }
    this.codeService.deleteCode(phone);
    return { token: this.jwtService.generateToken(user.id) };
  }

  async create(
    phone: string,
    code: string,
    first_name: string,
    last_name: string,
  ): Promise<{ token: string }> {
    await this.codeService.validateCode(phone, code, false);

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }
    this.codeService.deleteCode(phone);

    const newUser = await this.userRepository.save({
      phone,
      first_name,
      last_name,
      last_activity: new Date(),
    });

    const token = this.jwtService.generateToken(newUser.id);
    return { token };
  }

  async validateUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async refreshToken(oldToken: string) {
    try {
      const newToken = this.jwtService.refreshToken(oldToken);
      return { token: newToken };
    } catch {
      throw new InvalidTokenException();
    }
  }
}
