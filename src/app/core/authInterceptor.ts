import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { SessionService } from '../services/session/session-services';
import { AuthService } from '../services/auth/auth-service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  const sessionService = inject(SessionService);
  const authService = inject(AuthService);


  const accessToken = sessionService.getAccessToken();
  if (request.url.includes('/refresh-token')) {
    return next(request);
  }

  if (accessToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);
          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              const newToken = sessionService.getAccessToken();
              if (newToken) {
                refreshTokenSubject.next(newToken);
                return next(
                  request.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                  })
                );
              } else {
                authService.logout();
                return throwError(() => new Error('No new access token'));
              }
            }),
            catchError((err) => {
              isRefreshing = false;
              sessionService.clearTokens();
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token =>
              next(
                request.clone({
                  setHeaders: { Authorization: `Bearer ${token}` }
                })
              )
            )
          );
        }
      }

      return throwError(() => error);
    })
  );
};
