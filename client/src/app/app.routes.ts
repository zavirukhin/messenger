import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('@social/messenger').then(m => m.MessengerComponent),
    loadChildren: () => import('@social/messenger').then(m => m.messengerRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('@social/authorization').then(m => m.authorizationRoutes)
  }
];
