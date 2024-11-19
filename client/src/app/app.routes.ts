import { Route } from '@angular/router';
import { AuthGuard } from './guards/with-authorization.guard';
import { NoAuthGuard } from './guards/without-authorization.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('@social/messenger').then(m => m.messengerRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('@social/authorization').then(m => m.authorizationRoutes),
    canActivate: [NoAuthGuard]
  }
];
