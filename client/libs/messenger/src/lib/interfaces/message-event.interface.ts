export interface MessageEvent {
  id: number;
  chatId: number;
  userId: number;
  messageStatus: 'read' | 'send';
  content: string;
  createdAt?: Date;
}