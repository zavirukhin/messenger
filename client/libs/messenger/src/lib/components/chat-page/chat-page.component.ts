import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiButton, TuiFallbackSrcPipe, TuiIcon, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, combineLatest, EMPTY, finalize, map, switchMap, take } from 'rxjs';
import { SocketService } from '@social/shared';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { loader } from '../../transloco-loader';
import { Profile } from '../../types/profile.type';
import { ProfileService } from '../../services/profile/profile.service';
import { PaginationMessages } from '../../interfaces/pagination-messages.interface';
import { MessageEvent } from '../../interfaces/message-event.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideTranslocoScope({
      scope: 'messenger',
      loader
    })
  ]
})
export class ChatPageComponent {
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly chatService = inject(ChatService);

  private readonly router = inject(Router);

  private readonly profileService = inject(ProfileService);

  private readonly socketService = inject(SocketService);

  private destoryRef = inject(DestroyRef);

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
    });
  }

  public subscribeToNewMessages() {
    this.socketService.on<MessageEvent>('onNewMessage').pipe(
      takeUntilDestroyed(this.destoryRef)
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

    if (event.target.offsetHeight + event.target.scrollTop < event.target.scrollHeight) {
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
}