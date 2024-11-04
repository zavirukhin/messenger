import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';
import { CodeCooldownException } from '../exception/code-cooldown.exception';
import { CodeExpiredException } from '../exception/code-expired.exception';
import { InvalidCodeException } from '../exception/invalid-code.exception';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { generateCode } from '../utils/utils';
import { UserAlreadyExistsException } from '../exception/user-already-exists.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: MyJwtService,
  ) {}

  private codes = new Map<
    string,
    { code: string; expiresAt: number; lastSentAt: number }
  >();

  async sendCode(phone: string): Promise<void> {
    const now = Date.now();
    const cooldownPeriod = 60 * 1000; // 60 секунд
    const storedData = this.codes.get(phone);
    if (storedData && now - storedData.lastSentAt < cooldownPeriod) {
      throw new CodeCooldownException();
    }

    const code = generateCode();
    const expiresIn = 5 * 60 * 1000; // 5 минут
    const expiresAt = now + expiresIn;

    this.codes.set(phone, { code, expiresAt, lastSentAt: now });
    console.log(`Отправлен код ${code} для телефона ${phone}`);
  }

  async validateCode(phone: string, code: string): Promise<{ token: string }> {
    const storedCodeData = this.codes.get(phone);

    if (!storedCodeData) {
      throw new CodeExpiredException();
    }

    if (Date.now() > storedCodeData.expiresAt) {
      this.codes.delete(phone);
      throw new CodeExpiredException();
    }

    if (storedCodeData.code !== code) {
      throw new InvalidCodeException();
    }

    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new UserNotFoundException();
    }

    this.codes.delete(phone);

    const token = this.jwtService.generateToken(user.id);
    return { token };
  }

  async create(
    phone: string,
    code: string,
    first_name: string,
    last_name: string,
  ): Promise<{ token: string }> {
    const storedCodeData = this.codes.get(phone);

    if (!storedCodeData) {
      throw new CodeExpiredException();
    }

    if (Date.now() > storedCodeData.expiresAt) {
      this.codes.delete(phone);
      throw new CodeExpiredException();
    }

    if (storedCodeData.code !== code) {
      throw new InvalidCodeException();
    }

    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    this.codes.delete(phone);

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
}
