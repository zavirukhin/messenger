import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum MessageStatuses {
  SENT = 'send',
  READ = 'read',
}

@Entity('message-statuses')
export class MessageStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 25,
    enum: MessageStatus,
    enumName: 'message_status_enum',
  })
  name: MessageStatuses;
}
