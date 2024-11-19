import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSwitchComponent } from '../theme-switch/theme-switch.component';
import { MultilingualComponent } from '../multilingual/multilingual-component/multilingual.component';

@Component({
  selector: 'lib-app-switch-panel',
  standalone: true,
  imports: [CommonModule, ThemeSwitchComponent, MultilingualComponent],
  templateUrl: './switch-panel.component.html',
  styleUrl: './switch-panel.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchPanelComponent {}
