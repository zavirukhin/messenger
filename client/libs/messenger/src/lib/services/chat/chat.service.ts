import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { map, Observable, switchMap } from 'rxjs';
import { CacheService, SocketService } from '@social/shared';
import { Chat } from '../../interfaces/chat.interface';
import { UserRemoveEvent } from '../../interfaces/user-remove-event.interface';

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
  }

  private subscribeToNewChats(): void {
    this.socketService.on<Chat>('onNewChat')
    .subscribe((chat: Omit<Chat, 'latestMessage' | 'latestMessageDate' | 'unreadCount'>) => {
      this.putChat(chat);
    });
  }

  private subscribeToAddChats(): void {
    this.socketService.on<Chat>('onUserAddedToChat')
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