export interface User {
  token: string;
  mobilePhone: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface UpdateUser {
  _id?: string;
  mobilePhone?: string;
  fullName?: string;
  email?: string;
  terms?: boolean;
  address?: Address;
  organizationId?: { name: string }
  roles?: string[];
  vectorStoreId?: string
}

export interface UserResponse {
  data: UpdateUser[];
  total: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tempToken: string;
  access_token: string;
  refresh_token: string;
  rememberMe_Token: string
}
export interface TwoFactorAuth {
  otp: string;
  tempToken: string;
  access_token: string;
  refresh_token: string;
  rememberMe_token: string
}

export interface VerifyEmail {
  token: string;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  zipCode?: string;
}
export interface changePassword {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailReplyPrompt {
  customEmailReplyPrompt: string;
}

export interface UserPayload {
  id?: string;
  fullName: string;
  email: string;
  organizationId: { name: string };
  roles: string[];
}