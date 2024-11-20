import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ChatEvent } from '../../interfaces/chat-event.interface';
import { environment } from '@env';
import { CacheService } from '@social/shared';
import { UpdateChatPayload } from '../../types/chat.type';

@Injectable({
  providedIn: 'root'
})
export class ChatSettingsService {
  private readonly http = inject(HttpClient);

  private readonly cacheService = inject(CacheService);

  public getChat$(id: string): Observable<ChatEvent> {
    return this.http
      .get<ChatEvent>(environment.apiUrl + '/chats/' + id)
      .pipe(tap());
  }

  public updateChat$(chat: UpdateChatPayload): Observable<void> {
    return this.http
      .patch<void>(environment.apiUrl + '/chats/update', chat)
      .pipe(
        tap(() => {
          const cache = this.cacheService.get<ChatEvent>('chat');

          if (cache !== null) {
            this.cacheService.set<ChatEvent>('chat', {
              ...cache.value,
              ...chat
            });
          }
        })
      );
  }
}
