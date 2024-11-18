export interface ChatEvent {
  id: number;
  name: string;
  avatar: string | null;
  latestMessage?: string | null;
  latestMessageDate?: string | null;
  unreadCount?: number;
}