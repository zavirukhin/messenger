import { Chat } from '../interfaces/chat.interface';

export function sortChats(chats: Chat[]) {
  return chats.sort((a, b) => {
    if (a.latestMessageDate === null) {
      return 1;
    }

    if (b.latestMessageDate === null) {
      return -1;
    }

    return new Date(b.latestMessageDate).getTime() - new Date(a.latestMessageDate).getTime();
  });
}