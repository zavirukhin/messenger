import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { MyJwtService } from '../../jwt/service/jwt.service';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { UserAlreadyExistsException } from '../../exception/user-already-exists.exception';
import { CodeService } from './code.service';
import { MetricsService } from '../../metrics/service/metrics.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: MyJwtService,
    private readonly codeService: CodeService,
    private readonly metricsService: MetricsService,
  ) {}

  async sendCode(phone: string) {
    return this.codeService.sendCode(phone);
  }

  async validateCode(phone: string, code: string) {
    const start = Date.now();
    await this.codeService.validateCode(phone, code, false);
    const user = await this.findUserByPhone(phone);
    this.codeService.deleteCode(phone);

    this.metricsService.incrementAuthSuccess('POST', '200');

    this.metricsService.observeAuthRequestDuration(
      'POST',
      '200',
      (Date.now() - start) / 1000,
    );

    return { token: await this.jwtService.generateToken(user.id) };
  }

  async create(
    phone: string,
    code: string,
    firstName: string,
    lastName: string,
  ): Promise<{ token: string }> {
    const start = Date.now();
    await this.codeService.validateCode(phone, code, false);

    if (await this.userExists(phone)) {
      throw new UserAlreadyExistsException();
    }
    this.codeService.deleteCode(phone);

    const newUser = await this.createUser(phone, firstName, lastName);
    const token = await this.jwtService.generateToken(newUser.id);

    this.metricsService.incrementAuthSuccess('POST', '200');
    this.metricsService.observeAuthRequestDuration(
      'POST',
      '200',
      (Date.now() - start) / 1000,
    );

    return { token };
  }

  private async findUserByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      this.metricsService.incrementAuthFailure('POST', '404');
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
