import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-authorization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './authorization.component.html',
  styleUrl: './authorization.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorizationComponent {}
