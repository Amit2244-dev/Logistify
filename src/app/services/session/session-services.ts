import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EmailQueryParams } from '../../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly REMEMBER_ME_TOKEN_KEY = 'rememberMe_token';
  private readonly ACCESS_TOKEN_EXP_KEY = 'access_token_expiry';
  private readonly EMAIL_FILTER_KEY = 'email_filters';

  private memoryAccessToken: string | null = null;
  private memoryRefreshToken: string | null = null;
  private memoryRememberMeToken: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * @param accessToken - JWT access token string
   * @param refreshToken - JWT refresh token string
   * @return void
   * Stores access and refresh tokens in cookies and memory
   */
  setTokens(accessToken: string, refreshToken: string, rememberMe_Token: string): void {
    const now = new Date();
    const accessTokenExpiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    const refreshTokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const rememberMeTokenExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    this.memoryAccessToken = accessToken;
    this.memoryRefreshToken = refreshToken;
    this.memoryRememberMeToken = rememberMe_Token;

    this.setCookie(this.ACCESS_TOKEN_KEY, accessToken, accessTokenExpiry);
    this.setCookie(this.REFRESH_TOKEN_KEY, refreshToken, refreshTokenExpiry);
    this.setCookie(this.ACCESS_TOKEN_EXP_KEY, accessTokenExpiry.getTime().toString(), accessTokenExpiry);
    this.setCookie(this.REMEMBER_ME_TOKEN_KEY, rememberMe_Token, refreshTokenExpiry);
  }

  /**
   * @return string | null
   * Retrieves access token from memory or cookies
   */
  getAccessToken(): string | null {
    if (this.memoryAccessToken) return this.memoryAccessToken;
    const token = this.getCookie(this.ACCESS_TOKEN_KEY);
    this.memoryAccessToken = token;
    return token;
  }

  /**
   * @return string | null
   * Retrieves refresh token from memory or cookies
   */
  getRefreshToken(): string | null {
    if (this.memoryRefreshToken) return this.memoryRefreshToken;
    const token = this.getCookie(this.REFRESH_TOKEN_KEY);
    this.memoryRefreshToken = token;
    return token;
  }

  /**
 * @return string | null
 * Retrieves rememberMe token from memory or cookies
 */
  getRememberMeToken(): string | null {
    if (this.memoryRememberMeToken) return this.memoryRememberMeToken;
    const token = this.getCookie(this.REMEMBER_ME_TOKEN_KEY);
    this.memoryRememberMeToken = token;
    return token;
  }

  /**
   * @return boolean
   * Checks whether the access token is expired based on expiry cookie
   */
  isAccessTokenExpired(): boolean {
    const expiry = this.getCookie(this.ACCESS_TOKEN_EXP_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  }

  /**
   * @return void
   * Clears all tokens from memory and cookies
   */
  clearTokens(): void {
    this.memoryAccessToken = null;
    this.memoryRefreshToken = null;
    this.deleteCookie(this.ACCESS_TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
    this.deleteCookie(this.ACCESS_TOKEN_EXP_KEY);
  }

  /**
   * @return boolean
   * Checks whether user is authenticated by existence of a refresh token
   */
  isAuthenticated(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * @param name - Cookie name
   * @param value - Cookie value
   * @param expires - Expiry date for the cookie
   * @return void
   * Sets a secure cookie with SameSite=Strict
   */
  private setCookie(name: string, value: string, expires?: Date): void {
    if (!isPlatformBrowser(this.platformId)) return;
    let cookie = `${name}=${value}; path=/; SameSite=Strict;`;
    if (expires) cookie += ` expires=${expires.toUTCString()};`;
    if (location.protocol === 'https:') cookie += ' Secure;';
    document.cookie = cookie;
  }

  /**
   * @param name - Cookie name
   * @return string | null
   * Retrieves the value of a cookie by name
   */
  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "true";
    return "false";
  }

  /**
   * @param name - Cookie name
   * @return void
   * Deletes a cookie by setting it to expired
   */
  private deleteCookie(name: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }

  // ------------------------
  // sessionStorage for email filters
  // ------------------------

  /**
   * @param filters - The filter object to store in sessionStorage (e.g., search, sort, pagination, date range).
   * @return void
   * Stores email filters in sessionStorage under a constant key.
   */
  setEmailFiltersToSession(filters: EmailQueryParams): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.setItem(this.EMAIL_FILTER_KEY, JSON.stringify(filters));
  }

  /**
   * @return EmailQueryParams | null
   * Retrieves the email filters stored in sessionStorage. Returns `null` if not in browser or data is not found.
   */
  getEmailFiltersFromSession(): EmailQueryParams | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const data = sessionStorage.getItem(this.EMAIL_FILTER_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * @return void
   * Removes the email filters stored in sessionStorage.
   */
  clearEmailFiltersFromSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    sessionStorage.removeItem(this.EMAIL_FILTER_KEY);
  }
}