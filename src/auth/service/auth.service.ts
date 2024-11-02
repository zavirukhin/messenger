import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CodeExpiredException } from '../exception/code-expired.exception';
import { InvalidCodeException } from '../exception/invalid-code.exception';
import { CodeCooldownException } from '../exception/code-cooldown.exception';
import { MyJwtService } from './jwt.service';

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
    const cooldownPeriod = 60 * 1000; // 60 seconds

    const storedData = this.codes.get(phone);
    if (storedData && now - storedData.lastSentAt < cooldownPeriod) {
      throw new CodeCooldownException();
    }

    const code = this.generateCode();
    const expiresIn = 5 * 60 * 1000;
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

    this.codes.delete(phone);

    let user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      user = this.userRepository.create({ phone });
      await this.userRepository.save(user);
    }

    const token = this.jwtService.generateToken(user.id);
    return { token };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async validateUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
