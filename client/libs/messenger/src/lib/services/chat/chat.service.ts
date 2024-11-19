import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { map, Observable, switchMap, take, tap } from 'rxjs';
import { CacheService, SocketService } from '@social/shared';
import { Chat } from '../../interfaces/chat.interface';
import { UserRemoveEvent } from '../../interfaces/user-remove-event.interface';
import { MessageEvent } from '../../interfaces/message-event.interface';
import { ChatEvent } from '../../interfaces/chat-event.interface';
import { Contact } from '../../interfaces/contact.interface';
import { PaginationMessages } from '../../interfaces/pagination-messages.interface';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);

  private readonly cacheService = inject(CacheService);

  private readonly socketService = inject(SocketService); 

  private readonly profileService = inject(ProfileService);

  public subscribeToAllEvents(): void {
    this.socketService.createConnect();
    
    this.subscribeToNewChats();
    this.subscribeToAddChats();
    this.subscribeToRemoveUserChats();
    this.subscribeToChatUpdate();
    this.subscribeToStatusMessagesChange();
    this.subscribeToNewMessage();
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
      this.getChats(true).subscribe();
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
    this.socketService.on<MessageEvent[]>('onStatusMessagesChange')
    .subscribe((event: MessageEvent[]) => {
      if (event.length !== 0) {
        this.readChat(event[0].chatId);
      }
    });
  }

  private subscribeToNewMessage(): void {
    this.socketService.on<MessageEvent>('onNewMessage')
    .subscribe((event: MessageEvent) => {
      this.updateLastMessage(event);
    });
  }

  private updateLastMessage(message: MessageEvent): void {
    const chats = this.cacheService.get<Record<string, Chat>>('chats');
    
    if (chats === null) {
      return;
    }

    const chatCache = chats.value;
    const chatId = message.chatId.toString();

    if (chatCache[chatId] === undefined) {
      return;
    }

    const profile = this.profileService.getProfile();

    profile.pipe(
      take(1)
    ).subscribe((profile) => {
      if (profile.id === message.userId) {
        return;
      }

      chatCache[chatId] = {
        ...chatCache[chatId],
        unreadCount: chatCache[chatId].unreadCount + 1,
        latestMessage: message.content,
        latestMessageDate: new Date()
      }
  
      this.cacheService.set<Record<string, Chat>>('chats', chatCache);
    });
  }

  private readChat(chatId: number) {
    const chats = this.cacheService.get<Record<string, Chat>>('chats');
    
    if (chats === null) {
      return;
    }

    const chatCache = chats.value;
    const chatIdString = chatId.toString();

    if (chatCache[chatIdString] === undefined) {
      return;
    }

    chatCache[chatIdString] = {
      ...chatCache[chatIdString],
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
    const chatId = chat.id.toString();

    if (chatCache[chatId] === undefined) {
      return;
    }

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

  public getChats(force?: boolean): Observable<Record<string, Chat>> {
    if (force !== true) {
      const chat = this.cacheService.get<Record<string, Chat>>('chats');

      if (chat !== null) {
        return chat;
      }
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

  public createChat(chatName: string, contantList?: number[]): Observable<ChatEvent> {
    const body: { chatName: string; memberIds?: number[] } = { chatName };
    
    if (contantList && contantList.length) {
      body.memberIds = contantList;
    }

    return this.http.post<ChatEvent>(environment.apiUrl + '/chats/createWithMembers', body).pipe(
      tap((chat: ChatEvent) => {
        this.putChat(chat);
      })
    );
  }

  public getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(environment.apiUrl + '/contacts/list');
  }

  public addToChat(chatId: number, userId: number): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/chats/add-member', {
      chatId,
      newMemberId: userId
    });
  }

  public getChat(chatId: number): Observable<Chat> {
    return this.http.get<Chat>(environment.apiUrl + '/chats/' + chatId);
  }

  public sendMessage(chatId: number, message: string): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/messages/create', {
      chatId,
      content: message
    });
  }

  public getMessages(
    chatId: number,
    page: number,
    limit: number
  ): Observable<PaginationMessages> {
    return this.http.get<PaginationMessages>(
      environment.apiUrl + '/messages/' + chatId + '/history',
      {
        params: {
          page: page.toString(),
          limit: limit.toString()
        }
      }
    );
  }

  public markAsRead(chatId: number): Observable<void> {
    return this.http.post<void>(environment.apiUrl + '/messages/markChatMessagesAsRead', { chatId });
  }
}