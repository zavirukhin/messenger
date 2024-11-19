import { Route } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { loader } from './transloco-loader';
import { MessengerComponent } from './components/messenger/messenger.component';

export const messengerRoutes: Route[] = [
  {
    path: '',
    component: MessengerComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./components/chat-list-page/chat-list-page.component')
          .then((m) => m.ChatListPageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings-page/settings-page.component')
          .then((m) => m.SettingsPageComponent)
      },
      {
        path: 'user/:id',
        loadComponent: () => import('./components/user-page/user-page.component')
          .then((m) => m.UserPageComponent)
      },
      {
        path: '@/:id',
        loadComponent: () => import('./components/user-page/user-page.component')
          .then((m) => m.UserPageComponent)
      },
      {
        path: 'chat/:id',
        loadComponent: () => import('./components/chat-page/chat-page.component')
          .then((m) => m.ChatPageComponent)
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