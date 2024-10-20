import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-authorization',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './authorization.component.html',
  styleUrl: './authorization.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationComponent {}
