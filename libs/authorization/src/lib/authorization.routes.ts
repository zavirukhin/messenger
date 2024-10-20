import { Route } from '@angular/router';

export const authorizationRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./authorization/authorization.component').then((m) => m.AuthorizationComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./modal-telephone-number/modal-telephone-number.component')
          .then((m) => m.ModalTelephoneNumberComponent)
      }
    ]
  }
];
