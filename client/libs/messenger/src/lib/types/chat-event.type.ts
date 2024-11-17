import { Chat } from '../interfaces/chat.interface';

export type ChatEvent = Omit<Chat, 'latestMessage' | 'latestMessageDate' | 'unreadCount'>;