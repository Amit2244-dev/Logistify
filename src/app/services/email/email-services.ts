import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { environment } from '../../../environment/environment';
import {
  EmailQueryParams,
  EmailResponse,
  generatedNewReplyResponse,
  generateNewReplyRequest,
  ReplyEmailPayload,
  SendEmailPayload,
  updateEmail,
  updateUserConfiguration
} from '../../models/email.model';
import { handleApiError } from '../../common/utils/error-utils';

@Injectable({
  providedIn: 'root'
})
export class EmailServices {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * @param query - Email query params including pagination, filter, etc.
   * @return Observable<EmailResponse> - List of emails with total count
   */
  getAllEmails(query: EmailQueryParams): Observable<EmailResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ALL_EMAILS}`;
    return this.http.post<EmailResponse>(url, query).pipe(
      handleApiError<EmailResponse>('Get All Emails')
    );
  }

  /**
   * @param query - Email query params to fetch email accounts
   * @return Observable<EmailResponse> - Email accounts list response
   */
  getAllEmailAccounts(query: EmailQueryParams): Observable<EmailResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.Email_ACCOUNTS}`;
    return this.http.post<EmailResponse>(url, query).pipe(
      handleApiError<EmailResponse>('Get Email Accounts')
    );
  }

  /**
 * @return Observable<EmailResponse> - Email list response
 */
  refreshEmails(): Observable<EmailResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.REFERESH_EMAILS}`;
    return this.http.get<EmailResponse>(url).pipe(
      handleApiError<EmailResponse>('Refresh Emails')
    );
  }

  /**
   * @param payload - Email content and recipients
   * @return Observable<SendEmailPayload> - Confirmation of email sent
   */
  sendNewEmail(payload: FormData, fromEmail: string, provider: string): Observable<SendEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.SEND_EMAILS}?provider=${provider}`;
    const params = new HttpParams().set('email', fromEmail);
    return this.http.post<SendEmailPayload>(url, payload, { params }).pipe(
      handleApiError<SendEmailPayload>('Send New Email')
    );
  }



  /**
 * @param payload - Email content and recipients
 * @return Observable<SendEmailPayload> - Confirmation of email sent
 */
  updateUserConfiguration(payload: updateUserConfiguration): Observable<SendEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.DISSCONNECT_EMAIL_ACCOUNT}`;
    return this.http.post<SendEmailPayload>(url, payload).pipe(
      handleApiError<SendEmailPayload>('Disconnect Email Account')
    );
  }

  /**
 * @param payload - Email content and recipients
 * @return Observable<SendEmailPayload> - Confirmation of email sent
 */
  updateEmail(payload: updateEmail): Observable<SendEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.UPDATE_EMAIL}`;
    return this.http.put<SendEmailPayload>(url, payload).pipe(
      handleApiError<SendEmailPayload>('Update Email')
    );
  }

  /**
   * @param payload - Reply email content and recipients
   * @param emailId - ID of the email to reply to
   * @return Observable<ReplyEmailPayload> - Confirmation of reply sent
   */
  replyEmail(payload: ReplyEmailPayload, emailId: string, email: string, provider: string): Observable<ReplyEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.REPLY_EMAILS}${emailId}?provider=${provider}`;
    const params = new HttpParams().set('email', email);
    return this.http.post<ReplyEmailPayload>(url, payload, { params }).pipe(
      handleApiError<ReplyEmailPayload>('Reply Email')
    );
  }

  /**
   * @param payload - Reply email content for a draft
   * @param emailId - ID of the draft email
   * @return Observable<ReplyEmailPayload> - Confirmation of draft reply
   */
  replyDraftEmail(payload: ReplyEmailPayload, emailId: string, email: string, provider: string): Observable<ReplyEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.REPLY_DRAFT_EMAILS}${emailId}?provider=${provider}`;
    const params = new HttpParams().set('email', email);
    return this.http.post<ReplyEmailPayload>(url, payload, { params }).pipe(
      handleApiError<ReplyEmailPayload>('Reply Email')
    );
  }

  /**
   * @param payload - Email content to be saved as a draft
   * @param emailId - ID of the email thread
   * @return Observable<ReplyEmailPayload> - Confirmation of draft saved
   */
  saveDraft(payload: ReplyEmailPayload, emailId: string, email: string, provider: string): Observable<ReplyEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.CREATE_DRAFT_EMAILS}${emailId}?provider=${provider}`;
    const params = new HttpParams().set('email', email);
    return this.http.post<ReplyEmailPayload>(url, payload, { params }).pipe(
      handleApiError<ReplyEmailPayload>('Reply Email')
    );
  }

  /**
   * @param payload - generate reply content with subject
   * @param reply - reply text with summary and body
   * @return Observable<ReplyEmailPayload> - Confirmation new response
   */
  generateNewResponse(payload: generateNewReplyRequest): Observable<generatedNewReplyResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GENERATE_NEW_RESPONSE}`;
    return this.http.post<generatedNewReplyResponse>(url, payload).pipe(
      handleApiError<generatedNewReplyResponse>('Generate New Response')
    );
  }
}
