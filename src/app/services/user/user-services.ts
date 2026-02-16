import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  changePassword,
  EmailReplyPrompt,
  UpdateUser,
  User,
  UserResponse
} from '../../models/user.model';
import { environment } from '../../../environment/environment';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { handleApiError } from '../../common/utils/error-utils';
import { UserStoreService } from '../../core/userStore';
import { AccountSummaryParams } from '../../models/account-Summary.model';
@Injectable({
  providedIn: 'root'
})
export class UserServices {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userStore: UserStoreService
  ) { }

  /**
   * Register a new user.
   * @param userData - New user registration details.
   * @return Observable<User> - Created user object.
   */
  signup(userData: User): Observable<User> {
    const url = `${this.apiUrl}${API_ENDPOINTS.SIGN_UP}`;
    return this.http.post<User>(url, userData).pipe(
      handleApiError<User>('Signup')
    );
  }

  /**
   * Reset password using a token (forgot password flow).
   * @param userData - New password data.
   * @param token - Reset password token.
   * @return Observable<User> - Result of password reset.
   */
  changePassword(userData: User, token: string): Observable<User> {
    const payload = { ...userData, token };
    const url = `${this.apiUrl}${API_ENDPOINTS.RESET_PASSWORD}`;
    return this.http.post<User>(url, payload).pipe(
      handleApiError<User>('Change Password')
    );
  }

  /**
   * Request a password reset link via email.
   * @param userData - User email or identifier.
   * @return Observable<User> - Response of reset request.
   */
  resetPassword(userData: User): Observable<User> {
    const url = `${this.apiUrl}${API_ENDPOINTS.FORGOT_PASSWORD}`;
    return this.http.post<User>(url, userData).pipe(
      handleApiError<User>('Reset Password')
    );
  }

  /**
   * Fetch authenticated user's profile details.
   * @return Observable<UpdateUser> - Logged-in user's profile.
   */
  getUserDetail(): Observable<UpdateUser> {
    const url = `${this.apiUrl}${API_ENDPOINTS.USER_PROFILE}`;
    return this.http.get<UpdateUser>(url).pipe(
      tap(user => this.userStore.setUser(user)),
      handleApiError<UpdateUser>('User Details')
    );
  }

  /**
 * Fetch authenticated user's profile details.
 * @return Observable<UpdateUser> - Logged-in user's profile.
 */
  getAllUserDetail(query: AccountSummaryParams): Observable<UserResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_ALL_USERS}`;
    return this.http.post<UserResponse>(url, query).pipe(
      handleApiError<UserResponse>('User Details')
    );
  }

  /**
   * Update logged-in user's profile information.
   * @param userData - Updated user profile data.
   * @return Observable<UpdateUser> - Updated user profile.
   */
  updateUserProfile(userData: { id: string | undefined, updatedData: UpdateUser }): Observable<UpdateUser> {
    const url = `${this.apiUrl}${API_ENDPOINTS.UPDATE_PROFILE}`;
    return this.http.patch<UpdateUser>(url, userData).pipe(
      handleApiError<UpdateUser>('Update User Details')
    );
  }

  /**
   * Change current user's password (authenticated).
   * @param passwordData - Current and new password values.
   * @return Observable<changePassword> - Password update response.
   */
  updatePassword(passwordData: changePassword): Observable<changePassword> {
    const url = `${this.apiUrl}${API_ENDPOINTS.UPDATE_PASSWORD}`;
    return this.http.post<changePassword>(url, passwordData).pipe(
      handleApiError<changePassword>('Update Password')
    );
  }
}
