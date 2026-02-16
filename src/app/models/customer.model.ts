export interface Contact {
  fullName: string;
  phoneNumber: string;
  email: string;
  sendNotification: boolean;
}

export interface CustomerResponse {
  data: Customer[];
  total: number;
}

export interface CustomerQueryParams {
  sortOrder: string;
  sortBy: string;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  search: string;
}

export interface AddCustomerPayload {
  companyName: string;
  companyAddress: string;
  contacts: Contact[] | null;
}

export interface Customer {
  _id: string;
  companyName: string;
  companyAddress: string;
  contacts: Contact[] | null;
  createdAt?: string;
  updatedAt?: string;
}
