import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entity/user.entity';
import * as dotenv from 'dotenv';
import { JwtPayload } from './jwt-payload';
import { MyJwtService } from './service/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

dotenv.config();
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: MyJwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: payload.id },
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
  }
}
