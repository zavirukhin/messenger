import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { TuiButton, TuiDialog, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiChip } from '@taiga-ui/kit';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { finalize, map } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../interfaces/chat.interface';

@Component({
  selector: 'lib-chat-list-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiAvatar,
    TuiTitle,
    TuiChip,
    TuiButton,
    TuiDialog,
    TuiTextfield,
    TranslocoDirective,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './chat-list-page.component.html',
  styleUrl: './chat-list-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListPageComponent {
  private readonly chatService = inject(ChatService);

  public chats: Signal<Chat[] | undefined>;

  public openDialog = false;

  public form = new FormGroup({
    chatName: new FormControl('', [Validators.required])
  });

  constructor() {
    this.chats = toSignal(this.chatService.getChats().pipe(
      map((chats) => Object.values(chats))
    ));
  }

  public getCountUnreadMessages(count: number): string {
    if (count < 100) {
      return count.toString();
    }

    return '99+';
  }

  public getDate(date: Date | null): string {
    if (date === null) {
      return '';
    }

    const SECONDS_IN_DAY = 86400;
    const time = new Date(date);

    if ((new Date().getTime() - time.getTime()) < SECONDS_IN_DAY * 1000) {
      return formatDate(time, 'HH:MM', 'ru-RU');
    }

    return formatDate(time, 'dd:MM:yyyy', 'ru-RU');
  }

  public openDialogCreateChat(): void {
    this.openDialog = true;
  }

  public onSubmitCreateChat(): void {
    if (this.form.valid) {
      this.form.disable();

      this.chatService.createChat(this.form.value.chatName || '').pipe(
        finalize(() => {
          this.form.enable();
          this.form.reset();
        })
      ).subscribe(() => {
        this.openDialog = false;
      });
    }
  }
}