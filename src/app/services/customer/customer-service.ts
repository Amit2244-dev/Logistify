import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { handleApiError } from '../../common/utils/error-utils';
import { AddCustomerPayload, CustomerQueryParams, CustomerResponse } from '../../models/customer.model';
import { API_ENDPOINTS } from '../../common/constants/apiUrls';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  /**
   * @param query - customer query params including pagination, filter, etc.
   * @return Observable<CustomerResponse> - List of Customers with total count
   */
  getAllCustomers(query: CustomerQueryParams): Observable<CustomerResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ALL_CUSTOMER}`;
    return this.http.post<CustomerResponse>(url, query).pipe(
      handleApiError<CustomerResponse>('Get All Customers')
    );
  }

    /**
   * @param payload - Customer payload
   * @return Observable<AddCustomerPayload> - Confirmation of customer 
   */
  addNewCustomer(payload: AddCustomerPayload): Observable<CustomerResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ADD_CUSTOMER}`;
    return this.http.post<CustomerResponse>(url, payload).pipe(
      handleApiError<CustomerResponse>('Add New Customer')
    );
  }

      /**
   * @param payload - Customer payload
   * @return Observable<AddCustomerPayload> - Confirmation of customer 
   */
  updateCustomer(payload: AddCustomerPayload, customerId: string | undefined): Observable<CustomerResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ADD_CUSTOMER}/${customerId}`;
    return this.http.patch<CustomerResponse>(url, payload).pipe(
      handleApiError<CustomerResponse>('Update Customer')
    );
  }

     /**
   * @param payload - Customer payload
   * @return Observable<AddCustomerPayload> - Confirmation of customer 
   */
  removeCustomer(customerId: string | undefined): Observable<CustomerResponse> {
    const url = `${this.apiUrl}${API_ENDPOINTS.ADD_CUSTOMER}/${customerId}`;
    return this.http.delete<CustomerResponse>(url).pipe(
      handleApiError<CustomerResponse>('Remove Customer')
    );
  }

}
