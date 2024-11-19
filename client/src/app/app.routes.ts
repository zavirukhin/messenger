import { Route } from '@angular/router';
import { AuthGuard } from './guards/with-authorization.guard';
import { NoAuthGuard } from './guards/without-authorization.guard';
import { AboutPageComponent } from './components/about-page/about-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('@social/messenger').then(m => m.MessengerComponent),
    loadChildren: () => import('@social/messenger').then(m => m.messengerRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('@social/authorization').then(m => m.authorizationRoutes),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'about',
    component: AboutPageComponent
  }
];
