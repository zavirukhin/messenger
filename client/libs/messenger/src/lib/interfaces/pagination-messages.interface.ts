import { MessageEvent } from './message-event.interface';

export interface PaginationMessages {
  messages: MessageEvent[];
  totalMessages: number;
  page: number;
  limit: number;
  totalPages: number;
}