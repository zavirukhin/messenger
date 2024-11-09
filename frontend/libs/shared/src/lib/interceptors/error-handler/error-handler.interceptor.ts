import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { RequestError } from '../../errors/request.error';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const translocoService = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status;
      let errorText = translocoService.translate('unknownError');
      let errorCode = 'unknown_error';

      if (statusCode === 0 && window.navigator.onLine === false) {
        errorText = translocoService.translate('noInternetConnection');
        errorCode = 'no_internet_connection';
      }
      else if (statusCode === 0) {
        errorText = translocoService.translate('unknownError');
      }
      else if (error.error.errorCode && error.error.message) {
        const translateError = translocoService.translate(error.error.errorCode);
        errorCode = error.error.errorCode;
        errorText = error.error.errorCode === translateError ?
          error.error.message :
          translateError;
      }

      return throwError(() => new RequestError({
        errorText,
        statusCode,
        errorCode
      }));
    })
  );
};
