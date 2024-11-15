import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './service/user.service';
import { MyJwtService } from '../jwt/service/jwt.service';
import { BlockedUser } from '../entity/blocked-user.entity';
import { Contact } from '../entity/contact.entity';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedUser, Contact]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, MyJwtService],
  controllers: [UserController],
})
export class UserModule {}
