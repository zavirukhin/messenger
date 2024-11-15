import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from '../auth/auth.module';
import { MyJwtService } from '../jwt/service/jwt.service';
import { Chat } from '../entity/chat.entity';
import { ChatService } from './service/chat.service';
import { ChatController } from './controller/chat.controller';
import { ChatMember } from '../entity/chat-member.entity';
import { ChatRole } from '../entity/chat-role.entity';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, ChatRole]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [ChatService, MyJwtService],
  controllers: [ChatController],
})
export class ChatModule {}
