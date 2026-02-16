import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { FileQueryParams, FileResponse, FileVectorAiRequest, FileVectorAiResponse, signedResponse } from '../../models/file.model';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { handleApiError } from '../../common/utils/error-utils';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  /**
   * @param query - file query params including pagination, filter, etc.
   * @return Observable<FileResponse> - List of Files with total count
   */
  getAllFiles(query: FileQueryParams): Observable<FileResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_ALL_FILES}`;
    return this.http.post<FileResponse>(url, query).pipe(
      handleApiError<FileResponse>('Get All Files')
    );
  }

  /**
 * @param query - file query params including pagination, filter, etc.
 * @return Observable<FileResponse> - List of Files with total count
 */
  getAllAiVectorMessages(query: FileQueryParams): Observable<FileResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_ALL_AI_VECTOR_MESSAGES}`;
    return this.http.post<FileResponse>(url, query).pipe(
      handleApiError<FileResponse>('Get All AI messages')
    );
  }

  /**
   * Fetches a signed file or email list from the backend.
   * @param fileName - The name of the file to retrieve.
   * @returns Observable<signedResponse> - API response with data and total count.
   */
  viewFiles(fileName: string): Observable<signedResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.VIEW_FILE}?fileName=${encodeURIComponent(fileName)}`;
    return this.http.get<signedResponse>(url).pipe(
      handleApiError<signedResponse>('Refresh Emails')
    );
  }

  /**
   * Uploads a file to the backend.
   * @param formData - FormData containing the file.
   * @returns Observable<signedResponse> - API response after uploading.
   */
  uploadFile(formData: FormData): Observable<signedResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.UPLOAD_FILES}`;
    return this.http.post<signedResponse>(url, formData).pipe(
      handleApiError<signedResponse>('Upload File')
    );
  }

  /**
 * Uploads a file to the backend.
 * @param formData - FormData containing the file.
 * @returns Observable<signedResponse> - API response after uploading.
 */
  fetchFileResponse(payload: FileVectorAiRequest): Observable<FileVectorAiResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.GET_FILE_VECTOR_RESP}`;
    return this.http.post<FileVectorAiResponse>(url, payload).pipe(
      handleApiError<FileVectorAiResponse>('File Ai Response')
    );
  }

}
