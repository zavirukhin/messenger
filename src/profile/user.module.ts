import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './service/user.service';
import { MyJwtService } from '../jwt/service/jwt.service';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
