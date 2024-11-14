import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../ormconfig';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './profile/user.module';
import { BlockedUserModule } from './blocked-user/blocked-user.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UserModule,
    BlockedUserModule,
    ContactModule,
  ],
})
export class AppModule {}
