// error-utils.ts
import { Observable, OperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function handleApiError<T>(context: string = ''): OperatorFunction<T, T> {
  return catchError((error: any): Observable<T> => {
    const message = error?.error?.message || 'Unexpected error occurred';
    console.error(`${context} Error:`, message);
    return throwError(() => new Error(message));
  });
}
