import { Route } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { loader } from './transloco-loader';
import { AuthorizationPageComponent } from './components/authorization-page/authorization-page.component';

export const authorizationRoutes: Route[] = [
  {
    path: '',
    children: [
      { 
        path: '',
        component: AuthorizationPageComponent
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
