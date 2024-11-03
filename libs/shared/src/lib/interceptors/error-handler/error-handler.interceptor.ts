import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { RequestError } from '../../errors/request.error';
import { TuiAlertService } from '@taiga-ui/core';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);

  const alerts = inject(TuiAlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status;
      let errorText = translocoService.translate('unknownError');

      if (statusCode === 0 && window.navigator.onLine === false) {
        errorText = translocoService.translate('noInternetConnection');
      }
      else if (statusCode === 0) {
        errorText = translocoService.translate('unknownError');
      }
      else if (error.error.errorCode && error.error.errorText) {
        const translateError = translocoService.translate(error.error.errorCode);
        errorText = error.error.errorCode === translateError ?
          error.error.errorText :
          translateError;
      }

      alerts.open(errorText, {
        label: translocoService.translate('error'),
        appearance: 'error'
      })
      .subscribe();

      return throwError(() => new RequestError({
        errorText,
        statusCode
      }));
    })
  );
};
