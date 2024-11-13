import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () => import('@social/authorization').then((m) => m.authorizationRoutes)
  }
];
