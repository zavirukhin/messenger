import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SocketService } from '@social/shared';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';
import { ChatService } from '../../services/chat/chat.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private readonly router = inject(Router);

  public isExclude = signal<boolean>(false);

  private readonly excludeList = ['/chat'];

  constructor() {
    this.router.events.pipe(
      takeUntilDestroyed()
    ).subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isExclude.set(false);

        this.excludeList.forEach((path) => {
          if (e.url.startsWith(path)) {
            this.isExclude.set(e.url.startsWith(path));
          }
        });
      }
    });
  }

  public ngOnInit(): void {
    this.chatService.subscribeToAllEvents();
  }

  public ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
