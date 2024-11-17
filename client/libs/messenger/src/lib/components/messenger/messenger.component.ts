import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SocketService } from '@social/shared';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'lib-messenger',
  standalone: true,
  imports: [
    CommonModule,
    NavigationBarComponent,
    RouterOutlet
  ],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessengerComponent implements OnDestroy, OnInit {
  private readonly socketService = inject(SocketService);

  private readonly chatService = inject(ChatService);

  public ngOnInit(): void {
    this.chatService.subscribeToAllEvents();
  }

  public ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
