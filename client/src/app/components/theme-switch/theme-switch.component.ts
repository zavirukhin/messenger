import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TUI_DARK_MODE, TuiButton, TuiIcon, TuiOption } from '@taiga-ui/core';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiOption, TuiIcon],
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeSwitchComponent {
  protected readonly darkMode = inject(TUI_DARK_MODE);
}
