import { Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { handleApiError } from '../../common/utils/error-utils';
import { InvitesMessages, InviteUsers, OrganizationResponse, VerifyInvites } from '../../models/organization.model';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';
import { UserStoreService } from '../../core/userStore';

@Injectable( {
  providedIn: 'root'
} )
export class OrganizationsServices {

  private apiUrl = environment.apiUrl;
  constructor( private http: HttpClient, private readonly userStore: UserStoreService ) { }

  /**
 * @param payload - Customer payload
 * @return Observable<AddCustomerPayload> - Confirmation of customer 
 */
  sendInvitation( payload: InviteUsers ): Observable<InviteUsers> {
    const url = `${ this.apiUrl }${ API_ENDPOINTS.INVITE_USER }`;
    return this.http.post<InviteUsers>( url, payload ).pipe(
      handleApiError<InviteUsers>( 'Invite New User' )
    );
  }

  /**
* @param payload - Customer payload
* @return Observable<AddCustomerPayload> - Confirmation of customer 
*/
  verifyInvitation( payload: VerifyInvites ): Observable<InvitesMessages> {
    const url = `${ this.apiUrl }${ API_ENDPOINTS.VERIFY_INVITES }`;
    return this.http.post<InvitesMessages>( url, payload ).pipe(
      handleApiError<InvitesMessages>( 'Invite New User' )
    );
  }

  /**
     * Fetch tags details.
     * @return Observable<tags> - tags array
     */
  getOrganizationsDetail(): Observable<OrganizationResponse[]> {
    const url = `${ this.apiUrl }${ API_ENDPOINTS.GET_ALL_ORGANIZATIONS }`;
    return this.http.get<OrganizationResponse[]>( url ).pipe(
      handleApiError<OrganizationResponse[]>( 'Organizations Details' )
    );
  }

}
