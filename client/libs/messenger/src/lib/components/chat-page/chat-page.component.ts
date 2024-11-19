import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuiButton, TuiFallbackSrcPipe, TuiIcon, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, finalize, map, switchMap, take } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { loader } from '../../transloco-loader';

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

  public chat = signal<Chat | undefined>(undefined);

  public isLoading = signal<boolean>(false);

  public message = new FormControl('', [Validators.required]);

  constructor() {
    this.activatedRoute.params.pipe(
      take(1),
      map(params => params['id']),
      switchMap((id) => this.chatService.getChat(id)),
      catchError(() => {
        this.router.navigate(['/']);

        return EMPTY;
      })
    ).subscribe((chat) => {
      this.chat.set(chat);
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
}