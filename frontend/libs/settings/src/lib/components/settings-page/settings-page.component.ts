import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiButton, TuiTextfield, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'lib-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    TuiAvatar,
    TuiTitle,
    TuiTextfield,
    TuiButton
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {}
