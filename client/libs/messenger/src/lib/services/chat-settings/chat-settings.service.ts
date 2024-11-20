import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ChatEvent } from '../../interfaces/chat-event.interface';
import { environment } from '@env';
import { CacheService } from '@social/shared';
import { UpdateChatPayload } from '../../types/update-chat-payload.type';
import { Members } from '../../interfaces/members.interface';
import { removeMembers } from '../../interfaces/remove-member.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatSettingsService {
  private readonly http = inject(HttpClient);

  private readonly cacheService = inject(CacheService);

  public getChat$(id: string): Observable<ChatEvent> {
    return this.http.get<ChatEvent>(environment.apiUrl + '/chats/' + id);
  }

  public getChatMembers$(id: string): Observable<Members[]> {
    return this.http.get<Members[]>(
      environment.apiUrl + '/chats/' + id + '/listMembers'
    );
  }

  public removeChatMember$(data: removeMembers): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + '/chats/remove-member', {
      body: data
    });
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
