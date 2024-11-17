export interface MessageStatusEvent {
  chatId: number;
  userId: number;
  messageStatus: 'read' | 'send';
  content: string;
}