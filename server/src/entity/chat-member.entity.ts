import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Chat } from './chat.entity';
import { ChatRole } from './chat-role.entity';
import { User } from './user.entity';

@Entity('chat-members')
@Unique(['chat', 'user'])
export class ChatMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.id)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatRole, (chatRole) => chatRole.id)
  @JoinColumn({ name: 'chat_role_id' })
  chatRole: ChatRole;
}
