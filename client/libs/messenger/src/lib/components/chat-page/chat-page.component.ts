import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiButton, TuiFallbackSrcPipe, TuiIcon, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  map,
  ReplaySubject, 
  switchMap, 
  take, 
  takeUntil
} from 'rxjs';
import { SocketService } from '@social/shared';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { Profile } from '../../types/profile.type';
import { ProfileService } from '../../services/profile/profile.service';
import { PaginationMessages } from '../../interfaces/pagination-messages.interface';
import { MessageEvent } from '../../interfaces/message-event.interface';

@Component({
  selector: 'lib-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiAvatar,
    TuiIcon,
    TuiTitle,
    TuiButton,
    TuiLoader,
    TuiTextfield,
    RouterLink,
    TuiFallbackSrcPipe,
    TranslocoDirective,
    ReactiveFormsModule
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPageComponent implements OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly chatService = inject(ChatService);

  private readonly router = inject(Router);

  private readonly profileService = inject(ProfileService);

  private readonly socketService = inject(SocketService);

  private destory$ = new ReplaySubject<void>(1);

  public chat = signal<Chat | undefined>(undefined);

  public messagesHistory = signal<PaginationMessages | undefined>(undefined);

  public profile = signal<Profile | undefined>(undefined);

  public isLoading = signal<boolean>(false);

  public message = new FormControl('', [Validators.required]);

  constructor() {
    this.activatedRoute.params.pipe(
      take(1),
      map(params => params['id']),
      switchMap((id) => {
        return combineLatest([
          this.chatService.getChat(id),
          this.chatService.getMessages(id, 1, 100),
          this.profileService.getProfile()
        ])
      }),
      catchError(() => {
        this.router.navigate(['/']);

        return EMPTY;
      })
    ).subscribe(([chat, messages, profile]) => {
      this.chat.set(chat);
      this.messagesHistory.set(messages);
      this.profile.set(profile);

      this.subscribeToNewMessages();
      this.subscribeToMessageStatusChange();
    });
  }

  public subscribeToMessageStatusChange(): void {
    this.socketService.on<MessageEvent[]>('onStatusMessagesChange').pipe(
      takeUntil(this.destory$)
    ).subscribe((messages) => {
      const chat = this.chat();

      if (chat === undefined) {
        return;
      }

      const history = this.messagesHistory();

      if (history === undefined) {
        return;
      }

      messages.forEach((message) => {
        if (message.chatId !== chat.id) {
          return;
        }

        history.messages.forEach((v) => {
          if (v.id === message.id) {
            v.messageStatus = message.messageStatus;
          }
        });
      });

      this.messagesHistory.set({...history});
    })
  }

  public subscribeToNewMessages(): void {
    this.socketService.on<MessageEvent>('onNewMessage').pipe(
      takeUntil(this.destory$)
    ).subscribe((message) => {
      const chat = this.chat();

      if (chat === undefined) {
        return;
      }

      if (message.chatId !== chat.id) {
        return;
      }

      const history = this.messagesHistory();

      if (history === undefined) {
        return;
      }

      const messagesIds = new Set(history.messages.map((message) => message.id));

      if (!messagesIds.has(message.id)) {
        this.messagesHistory.set({
          ...history,
          messages: [
            message,
            ...history.messages
          ]
        });

        if (message.userId !== this.profile()?.id) {
          this.chatService.markAsRead(chat.id).subscribe();
        }
      }
    });
  }

  public sendMessage(): void {
    const chat = this.chat();

    if (chat === undefined || this.message.invalid) {
      return;
    }

    this.isLoading.set(true);

    this.chatService.sendMessage(chat.id, this.message.value || '').pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe(() => {
      this.message.reset();
    });
  }

  public loadMoreMessages(event: Event): void {
    if (event.target === null || !(event.target instanceof HTMLElement)) {
      return;
    }

    if (event.target.offsetHeight - event.target.scrollTop < event.target.scrollHeight) {
      return;
    }

    const chat = this.chat();

    if (chat === undefined) {
      return
    }

    const history = this.messagesHistory();

    if (history === undefined || history.page >= history.totalPages) {
      return;
    }

    this.chatService.getMessages(chat.id, history.page + 1, 100).subscribe((messages) => {
      const messagesIds = new Set(history.messages.map((message) => message.id));
      const newMessages = messages.messages.filter((message) => !messagesIds.has(message.id));

      this.messagesHistory.set({
        ...messages,
        messages: [
          ...history.messages,
          ...newMessages
        ]
      });
    });
  }

  public getDate(date: Date | null): string {
    if (date === null) {
      return '';
    }

    const SECONDS_IN_DAY = 86400;
    const time = new Date(date);

    if ((new Date().getTime() - time.getTime()) < SECONDS_IN_DAY * 1000) {
      return formatDate(time, 'HH:mm', 'ru-RU');
    }

    return formatDate(time, 'dd:MM:yyyy', 'ru-RU');
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}