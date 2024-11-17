export interface Chat {
  id: number;
  name: string;
  avatar: string | null;
  latestMessage: string | null;
  latestMessageDate: Date | null;
  unreadCount: number;
}