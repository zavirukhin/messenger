import { Route } from '@angular/router';

export const messengerRoutes: Route[] = [
  {
    path: 'settings',
    loadComponent: () => import('@social/settings').then(m => m.SettingsPageComponent)
  }
];