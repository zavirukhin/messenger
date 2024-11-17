import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiChip } from '@taiga-ui/kit';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { map } from 'rxjs';

@Component({
  selector: 'lib-chat-list-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiAvatar,
    TuiTitle,
    TuiChip
  ],
  templateUrl: './chat-list-page.component.html',
  styleUrl: './chat-list-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatListPageComponent {
  private readonly chatService = inject(ChatService);

  public chats: Signal<Chat[] | undefined>;

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
}