import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiHint, TuiIcon } from '@taiga-ui/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Tab } from '../../types/tab.type';
import { startWith } from 'rxjs';

@Component({
  selector: 'lib-navigation-bar',
  standalone: true,
  imports: [
    CommonModule,
    TuiIcon,
    TuiHint,
    TranslocoDirective,
    RouterLink
  ],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationBarComponent {
  private readonly router = inject(Router);

  public readonly activeTab = signal<Tab>('messenger');

  constructor() {
    this.router.events.pipe(
      takeUntilDestroyed(),
      startWith({ url: this.router.url })
    ).subscribe((e) => {
      if ('url' in e) {
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
