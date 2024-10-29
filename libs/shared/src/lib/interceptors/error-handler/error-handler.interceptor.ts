import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { RequestError } from '../../errors/request.error';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  /*
    Need use transloco service in interceptor, for translation common error,
    but i think not good idea how use service here
  */
  const translocoService = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status;

      if (statusCode === 0 && window.navigator.onLine === false) {
        return throwError(() => new RequestError({
          errorText: translocoService.translate('noInternetConnection'),
          statusCode
        }));
      }
      else if (statusCode === 0) {
        return throwError(() => new RequestError({
          errorText: translocoService.translate('unknownError'),
          statusCode
        }));
      }
      return throwError(() => new RequestError({
        errorText: error.error.errorText,
        statusCode
      }));
    })
  );
};
