import { Route } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { loader } from './transloco-loader';

export const messengerRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'settings',
        loadComponent: () => import('./components/settings-page/settings-page.component')
          .then(m => m.SettingsPageComponent)
      },
      {
        path: 'user/:id',
        loadComponent: () => import('./components/user-page/user-page.component')
          .then(m => m.UserPageComponent)
      },
      {
        path: '@/:id',
        loadComponent: () => import('./components/user-page/user-page.component')
          .then(m => m.UserPageComponent)
      }
    ],
    providers: [
      provideTranslocoScope({
        scope: 'messenger',
        loader
      })
    ]
  }
];