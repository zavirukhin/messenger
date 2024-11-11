import { Route } from '@angular/router';

export const messengerRoutes: Route[] = [
  {
    path: 'settings',
    loadComponent: () => import('./components/settings-page/settings-page.component')
      .then(m => m.SettingsPageComponent)
  }
];