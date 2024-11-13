import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-authorization-page',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './authorization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationComponent {}
