import { User } from './src/entity/user.entity';
import { UserInit1730566248080 } from './src/migrations/1730566248080-UserInit';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { BlockedUser } from './src/entity/blocked-user.entity';
import { CreateBlockedUsersTable1731174734262 } from './src/migrations/1731174734262-CreateBlockedUsersTable';
import { Contact } from './src/entity/contact.entity';
import { CreateContactsTable1731195410302 } from './src/migrations/1731195410302-CreateContactsTable';
import { Chat } from './src/entity/chat.entity';
import { ChatRole } from './src/entity/chat-role.entity';
import { ChatMember } from './src/entity/chat-member.entity';
import { CreateChatsTable1731615286505 } from './src/migrations/1731615286505-CreateChatsTable';
import { CreateMessageAndMessageStatusTables1731714959091 } from './src/migrations/1731714959091-CreateMessageAndMessageStatusTables';
import { MessageStatus } from './src/entity/message-status.entity';
import { Message } from './src/entity/message.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: process.env.DB_LOGGING === 'true',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  entities: [User, BlockedUser, Contact, Chat, ChatRole, ChatMember, MessageStatus, Message],
  migrations: [UserInit1730566248080, CreateBlockedUsersTable1731174734262, CreateContactsTable1731195410302, CreateChatsTable1731615286505, CreateMessageAndMessageStatusTables1731714959091],
};
export const AppDataSource = new DataSource(dataSourceOptions);
