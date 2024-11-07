import { Route } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const authorizationRoutes: Route[] = [
  {
    path: '',
    component: SettingsComponent,
    providers: []
  }
];
