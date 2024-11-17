import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { Chat } from '../../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);

  public getChats(): Observable<Chat[]> {
    return this.http.get<Chat[]>(environment.apiUrl + '/chats/list');
  }
}