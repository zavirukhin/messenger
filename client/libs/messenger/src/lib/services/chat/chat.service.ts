import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { map, Observable, switchMap } from 'rxjs';
import { CacheService } from '@social/shared';
import { Chat } from '../../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);

  private readonly cacheSerivce = inject(CacheService);

  public getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(environment.apiUrl + '/chats/list').pipe(
      map((chats) => {
        const cache = this.cacheSerivce.set<Chat[]>('chats', chats);
        return cache;
      }),
      switchMap((chats) => chats)
    );
  }
}