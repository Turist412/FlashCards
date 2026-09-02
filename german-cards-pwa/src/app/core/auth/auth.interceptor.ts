import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Injector } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AUTH_API_PATHS, AUTH_TOKEN_KEY } from './auth.constants';
import { AuthService } from './auth.service';

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiUrl);
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes(AUTH_API_PATHS.login) || url.includes(AUTH_API_PATHS.register)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  // БЕРЕМ ИДЕНТИФИКАТОР ПЛАТФОРМЫ
  const platformId = inject(PLATFORM_ID);

  // ПРОВЕРЯЕМ БЕЗОПАСНО, КАК В СЕРВИСЕ
  const token = isPlatformBrowser(platformId)
    ? localStorage.getItem(AUTH_TOKEN_KEY)
    : null;

  const authReq = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  const injector = inject(Injector);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        injector.get(AuthService).logout();
      }
      return throwError(() => error);
    }),
  );
};
