import { HttpInterceptorFn } from '@angular/common/http';

export const authorizationHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token === null) {
    return next(req);
  }

  const request = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })

  return next(request);
}