import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('chat-roles')
export class ChatRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
    enum: UserRole,
    enumName: 'user_role_enum',
  })
  name: UserRole;
}
