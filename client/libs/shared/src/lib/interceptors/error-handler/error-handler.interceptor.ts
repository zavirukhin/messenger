import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { TuiAlertService } from '@taiga-ui/core';
import { catchError, throwError } from 'rxjs';
import { RequestError } from '../../errors/request.error';
import { DISABLE_ALERT } from '../../tokens/disable-alert.token';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);
  
  const alerts = inject(TuiAlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status;
      let errorText = error.message;
      let errorCode = 'unknown_error';

      if (statusCode === 0 && window.navigator.onLine === false) {
        errorText = translocoService.translate('noInternetConnection');
        errorCode = 'no_internet_connection';
      }
      else if (error.error.errorCode && error.error.message) {
        const translateError = translocoService.translate(error.error.errorCode);
        errorCode = error.error.errorCode;
        errorText = error.error.errorCode === translateError ?
          error.error.message :
          translateError;
      }

      if (!req.context.get(DISABLE_ALERT).includes(errorCode)) {
        alerts.open(errorText, {
          label: translocoService.translate('error'),
          appearance: 'error'
        }).subscribe();
      }

      return throwError(() => new RequestError({
        errorText,
        statusCode,
        errorCode
      }));
    })
  );
};

