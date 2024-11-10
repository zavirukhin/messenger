import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from '../auth/auth.module';
import { MyJwtService } from '../jwt/service/jwt.service';
import { User } from '../entity/user.entity';
import { Contact } from '../entity/contact.entity';
import { ContactService } from './service/contact.service';
import { ContactController } from './controller/contact.controller';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([Contact, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [ContactService, MyJwtService],
  controllers: [ContactController],
})
export class ContactModule {}
