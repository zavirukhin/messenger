import { ChatEvent } from '../interfaces/chat-event.interface';

export type UpdateChatPayload = Omit<ChatEvent, 'id'> & {
  chatId?: number;
};
