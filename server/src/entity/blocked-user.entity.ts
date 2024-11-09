import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_users')
@Unique(['blockedUser', 'blockedByUser'])
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'blocked_user_id' })
  blockedUser: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'blocked_by_user_id' })
  blockedByUser: User;
}
