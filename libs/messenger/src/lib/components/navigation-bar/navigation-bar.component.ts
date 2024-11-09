import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { Tab } from '../../types/tab.type';

@Component({
  selector: 'lib-navigation-bar',
  standalone: true,
  imports: [
    CommonModule,
    TuiIcon
  ],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent {
  public activeTab: Tab = 'settings';

  changeTab(tab: Tab) {
    this.activeTab = tab;
  }
}
