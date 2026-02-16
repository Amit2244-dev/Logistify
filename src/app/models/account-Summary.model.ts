export interface CreateAccountSummaryPayload {
  userAccount: string;
  userAccountId: string; // ObjectId as string
  emailAccount: string;
  aiSummaryResponse?: string;
  createdAt?: string;
  range?: { startDate: string, endDate: string };
  timeWindow?: { startTime: string, endTime: string }
}

export interface AccountSummaryResponse {
  data: [];
  total: number;
}

export interface AccountSummaryParams {
  sortOrder: string;
  sortBy: string;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  search: string;
}