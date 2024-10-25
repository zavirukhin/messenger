import { Route } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { loader } from './transloco-loader';

export const authorizationRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./authorization.component').then(m => m.AuthorizationComponent),
    children: [
      { 
        path: '',
        loadComponent: () => import('./components/authorization-page/authorization-page.component')
          .then(m => m.AuthorizationPageComponent)
      }
    ],
    providers: [
      provideTranslocoScope({
        scope: 'authorization',
        loader
      })
    ]
  }
];
