export interface MessageEvent {
  chatId: number;
  userId: number;
  messageStatus: 'read' | 'send';
  content: string;
  createdAt?: Date;
}