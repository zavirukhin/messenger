import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl, {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  emit(event: string, data: unknown) {
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }
}