import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('contacts')
@Unique(['contactedUser', 'contactedByUser'])
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'contacted_user_id' })
  contactedUser: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'contacted_by_user_id' })
  contactedByUser: User;
}
