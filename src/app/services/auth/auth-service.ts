import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { changePassword, LoginCredentials, TwoFactorAuth, UpdateUser, User, VerifyEmail } from '../../models/user.model';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { Router } from '@angular/router';
import { SessionService } from '../session/session-services';
import { Token } from '../../models/token.model';
import { handleApiError } from '../../common/utils/error-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService,
  ) { }

  /**
   * @param credentials TwoFactorAuth - Contains OTP and email
   * @return Observable<TwoFactorAuth>
   */
  verifyTwoFactorOtp(credentials: TwoFactorAuth): Observable<TwoFactorAuth> {
    const url = `${this.apiUrl}${API_ENDPOINTS.VERIFY_TWO_FACTOR_AUTH}`;
    return this.http.post<TwoFactorAuth>(url, credentials).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token && response.rememberMe_token) {
          this.sessionService.setTokens(response.access_token, response.refresh_token, response.rememberMe_token);
        }
      }),
      handleApiError<TwoFactorAuth>('Verify 2FA')
    );
  }

  /**
   * @param credentials TwoFactorAuth - Contains email to resend OTP
   * @return Observable<TwoFactorAuth>
   */
  resendOtp(credentials: TwoFactorAuth): Observable<TwoFactorAuth> {
    const url = `${this.apiUrl}${API_ENDPOINTS.RESEND_OTP}`;
    return this.http.post<TwoFactorAuth>(url, credentials).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token && response.rememberMe_token) {
          this.sessionService.setTokens(response.access_token, response.refresh_token, response.rememberMe_token);
        }
      }),
      handleApiError<TwoFactorAuth>('Resend OTP')
    );
  }

  /**
   * @param credentials LoginCredentials - Contains email and password
   * @return Observable<LoginCredentials>
   */
  login(credentials: LoginCredentials): Observable<LoginCredentials> {
    const url = `${this.apiUrl}${API_ENDPOINTS.LOGIN}`;
    credentials.rememberMe_Token = this.sessionService.getRememberMeToken() || '';
    return this.http.post<LoginCredentials>(url, credentials).pipe(
      tap(response => {
        if (response.access_token && response.refresh_token) {
          this.sessionService.setTokens(response.access_token, response.refresh_token || '', response.rememberMe_Token || '');
        }
      }),
      handleApiError<LoginCredentials>('Login')
    );
  }

  /**
   * @param credentials VerifyEmail - Contains email and code
   * @return Observable<VerifyEmail>
   */
  verifyEmail(credentials: VerifyEmail): Observable<VerifyEmail> {
    const url = `${this.apiUrl}${API_ENDPOINTS.Verify_EMAIL}`;
    return this.http.post<VerifyEmail>(url, credentials).pipe(
      handleApiError<VerifyEmail>('Verify Email')
    );
  }

  /**
   * @return Observable<Token> - Refreshes access token using refresh token
   */
  refreshToken(): Observable<Token> {
    const refreshToken = this.sessionService.getRefreshToken();
    const rememberMe_Token = this.sessionService.getRememberMeToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (!rememberMe_Token) {
      return throwError(() => new Error('No rememberMe token available'));
    }

    const url = `${this.apiUrl}${API_ENDPOINTS.REFRESH_TOKEN}`;
    return this.http.post<Token>(url, { token: refreshToken }).pipe(
      tap(response => {
        if (response.access_token) {
          this.sessionService.setTokens(response.access_token, response.refresh_token || refreshToken, rememberMe_Token || '');
        }
      }),
      catchError(error => {
        this.sessionService.clearTokens();
        return throwError(() => error);
      })
    );
  }

  /**
   * @return boolean - Returns true if access token exists and is valid
   */
  isAuthenticated(): boolean {
    return this.sessionService.isAuthenticated();
  }

  /**
   * @return void - Clears tokens and redirects to login
   */
  logout(): void {
    this.sessionService.clearTokens();
    this.router.navigate(['/']);
  }
}
