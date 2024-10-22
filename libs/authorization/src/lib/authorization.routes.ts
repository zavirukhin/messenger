import { Route } from '@angular/router';

export const authorizationRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/authorization-page/authorization-page.component')
      .then((m) => m.AuthorizationPageComponent)
  }
];
