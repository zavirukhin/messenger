import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { Tab } from '../../types/tab.type';

@Component({
  selector: 'lib-navigation-bar',
  standalone: true,
  imports: [
    CommonModule,
    TuiIcon,
    RouterLink
  ],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent {
  private router = inject(Router);

  public activeTab = signal<Tab>('messenger');

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.changeTab(e.url);
      }
    });
  }

  private changeTab(path: string) {
    switch (path) {
      case '/contacts':
        this.activeTab.set('contacts');
        break;
      case '/settings':
        this.activeTab.set('settings');
        break;
      default:
        this.activeTab.set('messenger');
        break;
    }
  }
}
