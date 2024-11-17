export interface UserRemoveEvent {
  type: 'user_removed';
  chatId: number;
  userId: number;
}