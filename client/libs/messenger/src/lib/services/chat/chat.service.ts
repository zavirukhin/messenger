import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { map, Observable, switchMap } from 'rxjs';
import { CacheService, SocketService } from '@social/shared';
import { Chat } from '../../interfaces/chat.interface';
import { UserRemoveEvent } from '../../interfaces/user-remove-event.interface';
import { ChatEvent } from '../../types/chat-event.type';
import { MessageStatusEvent } from '../../interfaces/message-status-event.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);

  private readonly cacheService = inject(CacheService);

  private readonly socketService = inject(SocketService);

  public subscribeToAllEvents(): void {
    this.socketService.createConnect();
    
    this.subscribeToNewChats();
    this.subscribeToAddChats();
    this.subscribeToRemoveUserChats();
    this.subscribeToChatUpdate();
    this.subscribeToStatusMessagesChange();
  }

  private subscribeToNewChats(): void {
    this.socketService.on<ChatEvent>('onNewChat')
    .subscribe((chat) => {
      this.putChat(chat);
    });
  }

  private subscribeToAddChats(): void {
    this.socketService.on<ChatEvent>('onUserAddedToChat')
    .subscribe(() => {
      this.getChats().subscribe();
    });
  }

  private subscribeToRemoveUserChats(): void {
    this.socketService.on<UserRemoveEvent>('onUserRemovedFromChat')
    .subscribe((event: UserRemoveEvent) => {
      this.removeChat(event.chatId);
    });
  }

  private subscribeToChatUpdate(): void {
    this.socketService.on<ChatEvent>('onChatUpdated')
    .subscribe((event: ChatEvent) => {
      this.updateChat(event);
    });
  }

  private subscribeToStatusMessagesChange(): void {
    this.socketService.on<MessageStatusEvent[]>('onStatusMessagesChange')
    .subscribe((event: MessageStatusEvent[]) => {
      if (event.length !== 0) {
        this.readChat(event[0].chatId);
      }
    });
  }

  private readChat(chatId: number) {
    const chats = this.cacheService.get<Record<string, Chat>>('chats');
    
    if (chats === null) {
      return;
    }

    const chatCache = chats.value;

    if (chatCache === undefined) {
      return;
    }

    const chatIdString = chatId.toString();

    chatCache[chatIdString] = {
      ...chatCache[chatId],
      unreadCount: 0
    }

    this.cacheService.set<Record<string, Chat>>('chats', chatCache);
  }

  private updateChat(chat: ChatEvent): void {
    const chats = this.cacheService.get<Record<string, Chat>>('chats');
    
    if (chats === null) {
      return;
    }

    const chatCache = chats.value;

    if (chatCache === undefined) {
      return;
    }

    const chatId = chat.id.toString();

    chatCache[chatId] = {
      ...chatCache[chatId],
      name: chat.name,
      avatar: chat.avatar
    }

    this.cacheService.set<Record<string, Chat>>('chats', chatCache);
  }

  private removeChat(chatId: number): void {
    const chats = this.cacheService.get<Record<string, Chat>>('chats');
    
    if (chats) {
      const newChats: Record<string, Chat> = {};

      Object.entries(chats.value).forEach(([k, v]) => {
        if (k !== chatId.toString()) {
          newChats[k] = v;
        }
      });

      this.cacheService.set<Record<string, Chat>>('chats', newChats);
    }
  }

  private putChat(chat: Omit<Chat, 'latestMessage' | 'latestMessageDate' | 'unreadCount'>): void {
    const cache = this.cacheService.get<Record<string, Chat>>('chats');
    const chats = cache?.value;

    if (chats !== undefined) {
      chats[chat.id.toString()] = {
        ...chat,
        latestMessage: null,
        latestMessageDate: null,
        unreadCount: 0
      };

      this.cacheService.set<Record<string, Chat>>('chats', chats);
    }
  }

  public getChats(): Observable<Record<string, Chat>> {
    const chat = this.cacheService.get<Record<string, Chat>>('chats');

    if (chat !== null) {
      return chat;
    }

    return this.http.get<Chat[]>(environment.apiUrl + '/chats/list').pipe(
      map((chats) => {
        const chatMap: Record<string, Chat> = {};
        
        chats.forEach((chat) => {
          const chatId = chat.id.toString();
          chatMap[chatId] = chat;
        });

        return this.cacheService.set<Record<string, Chat>>('chats', chatMap);
      }),
      switchMap((chats) => chats)
    );
  }
}