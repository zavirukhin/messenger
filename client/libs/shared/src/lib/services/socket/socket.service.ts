import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  private destory$: Subject<void> = new Subject<void>();

  private isSocketConnected = false;

  constructor() {
    this.socket = io(environment.apiUrl, {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
    this.isSocketConnected = true;
  }

  public createConnect(): void {
    if (this.isSocketConnected) {
      return;
    }

    this.socket = io(environment.apiUrl, {
      extraHeaders: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    });
  }

  public emit(event: string, data: unknown) {
    this.socket.emit(event, data);
  }

  public on<T>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.on(event, (data: T) => {
        observer.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    }).pipe(
      takeUntil(this.destory$)
    );
  }

  public disconnect(): void {
    this.socket.disconnect();
    this.socket.off();
    this.destory$.next();

    this.isSocketConnected = false;
  }
}