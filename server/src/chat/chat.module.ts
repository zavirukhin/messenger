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
import { MessageController } from './controller/message.controller';
import { MessageService } from './service/message.service';
import { Message } from '../entity/message.entity';
import { MessageStatus } from '../entity/message-status.entity';
import { MessageGateway } from './gateway/message.gateway';
import { MessageSocketService } from './service/message-socket.service';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      ChatMember,
      ChatRole,
      Message,
      MessageStatus,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [
    ChatService,
    MessageService,
    MyJwtService,
    MessageGateway,
    MessageSocketService,
  ],
  controllers: [ChatController, MessageController],
})
export class ChatModule {}
