import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../navigation-bar/navigation-bar.component';

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
export class MessengerComponent {}
