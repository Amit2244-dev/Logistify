import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../session/session-services';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { handleApiError } from '../../common/utils/error-utils';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { AccountSummaryResponse, CreateAccountSummaryPayload } from '../../models/account-Summary.model';
import { FileQueryParams } from '../../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class AccountSummary {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService,
  ) { }

  /**
   * @param payload CreateAccountSummaryPayload - Contains account summary details
   * @return Observable<CreateAccountSummaryPayload>
   */
  createAccountSummary(payload: CreateAccountSummaryPayload): Observable<CreateAccountSummaryPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ADD_ACCOUNT_SUMMARY}`;
    return this.http.post<CreateAccountSummaryPayload>(url, payload).pipe(
      handleApiError<CreateAccountSummaryPayload>('Create Account Summary')
    );
  }

  /**
   * Fetch authenticated user's account summaries.
   * @return Observable<CreateAccountSummaryPayload[]> - List of account summaries.
   */
  getAllAccountSummary(query: FileQueryParams): Observable<AccountSummaryResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_ALL_ACCOUNT_SUMMARY}`;
    return this.http.post<AccountSummaryResponse>(url, query).pipe(
      handleApiError<AccountSummaryResponse>('Account Summary Details')
    );
  }


}