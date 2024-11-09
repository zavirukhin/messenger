import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from '../auth/auth.module';
import { MyJwtService } from '../jwt/service/jwt.service';
import { BlockedUser } from '../entity/blocked-user.entity';
import { BlockedUserService } from './service/blocked-user.service';
import { BlockedUserController } from './controller/blocked-user.controller';
import { User } from '../entity/user.entity';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([BlockedUser, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [BlockedUserService, MyJwtService],
  controllers: [BlockedUserController],
})
export class BlockedUserModule {}
