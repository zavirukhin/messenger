export interface MessageEvent {
  id: number;
  chatId: number;
  userId: number;
  messageStatus: 'read' | 'send';
  userAvatar: string | null;
  firstName: string;
  lastName: string;
  content: string;
  createdAt?: Date;
}