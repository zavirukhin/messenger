import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly router = inject(Router);

  private readonly excludeList = ['/chat'];

  public readonly activeTab = signal<Tab>('messenger');

  public isExclude = signal<boolean>(false);

  constructor() {
    this.router.events.pipe(
      takeUntilDestroyed()
    ).subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isExclude.set(false);

        this.excludeList.forEach((path) => {
          if (e.url.startsWith(path)) {
            this.isExclude.set(e.url.startsWith(path));
          }
        });

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
