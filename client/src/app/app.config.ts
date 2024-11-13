import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import * as Sentry from '@sentry/angular';
import { authorizationHandlerInterceptor, errorHandlerInterceptor } from '@social/shared';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';
import localeRu from '@angular/common/locales/ru';
import localeRuExtra from '@angular/common/locales/extra/ru';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader.service';
import { registerLocaleData } from '@angular/common';
import { MultilingualService } from './services/multilingual.service';

registerLocaleData(localeRu, 'ru-RU', localeRuExtra);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    NG_EVENT_PLUGINS,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler()
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (
        translocoService: TranslocoService, multilingualService: MultilingualService
      ) => (() => {
        const language = multilingualService.getLanguageFromLocalStorage() || 'en';
        
        if (language === 'en'){
          multilingualService.saveLanguageToLocalStorage('en');
        }
        translocoService.setActiveLang(language);
        
        return firstValueFrom(translocoService.load('en'));
      }),
      deps: [TranslocoService, MultilingualService, Sentry.TraceService],
      multi: true
    },
    provideHttpClient(
      withInterceptors([errorHandlerInterceptor, authorizationHandlerInterceptor])
    ),
    provideTransloco({
      config: { 
        availableLangs: ['en', 'ru'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })
  ]
};
