import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SwitchPanelComponent } from '../switch-panel/switch-panel.component';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SwitchPanelComponent,
    TuiButton,
    TranslocoDirective
  ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPageComponent {}
