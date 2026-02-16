import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { SendEmailPayload } from '../../models/email.model';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { handleApiError } from '../../common/utils/error-utils';
import { UserStoreService } from '../../core/userStore';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private userStore: UserStoreService) { }

  /**
   * @param payload - add tags
   * @return Observable<tags> -Array
   */
  addTags(payload: { id: string; tags: string[]; }): Observable<SendEmailPayload> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ADD_TAG}`;
    return this.http.post<SendEmailPayload>(url, payload).pipe(
      handleApiError<SendEmailPayload>('Add Tags')
    );
  }

  /**
     * Fetch tags details.
     * @return Observable<tags> - tags array
     */
  getTagsDetail(): Observable<string[]> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_TAGS}`;
    return this.http.get<string[]>(url).pipe(
      tap(user => this.userStore.setTags(user)),
      handleApiError<string[]>('tags Details')
    );
  }
}
