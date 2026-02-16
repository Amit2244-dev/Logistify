export interface EmailQueryParams {
  searchKeys: {
    fullName?: string; email?: string; roles?: string; subject?: string, aiSummaryResponse?: string, tags?: string, fromEmail?: string, fileName?: string, aiGeneratedResponse?: string, emailAccount?: string, userAccount?: string, companyName?: string, companyAddress?: string, contactsEmail?: string, userId?: string
  };
  sortOrder: string;
  sortBy: string;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  search: string;
  emailAccount: string;
  emailStatus: string;
}

export interface Email {
  customEmailReplyPrompt: any;
  isConnected: boolean;
  expiresAt: number;
  email: string;
  _id: string;
  to: string;
  emailId: string;
  subject: string;
  body: string;
  toEmail: string[];
  fromEmail: string;
  ccEmail: string[];
  bccEmail: string[];
  status: 'READ' | 'UNREAD' | string;
  language: string;
  providerId: string;
  provider: string;
  emailAccount: string;
  createdAt: string; // or Date if parsed
  updatedAt: string; // or Date
  importance: 'low' | 'medium' | 'high' | string;
  hasAttachments: boolean;
  isDraftReply: boolean;
  aiGeneratedResponse: string;
  isArchive: boolean;
  aiSummaryResponse: string;
  files: File[];
  tags: string[]
  linkedAt?: string;
  displayName?: string;
}

export interface EmailResponse {
  data: Email[];
  total: number;
}
export type EmailContentType = 'Text' | 'HTML';
export interface updateUserConfiguration {
  updateData: any
  query: any
}
export interface SendEmailPayload {
  subject: string;
  body: {
    contentType: EmailContentType;
    content: string;
  };
  toRecipients: EmailRecipient[];
  ccRecipients?: EmailRecipient[];
  bccRecipients?: EmailRecipient[];
  attachments: File[];
}

export interface updateEmail {
  query: { id: string };
  updateData: { isArchive: boolean };
}
export interface EmailRecipient {
  emailAddress: {
    address: string;
  };
}

export interface EmailAddress {
  value: string;
  viewValue: string;
  provider: string;
  isConnected: boolean;
  expiresAt: number;
  customEmailReplyPrompt: string;
}
export interface UserAccountOption {
  value: string;
  viewValue: string;
  userId: string
}
export interface generateNewReplyRequest {
  email: Partial<Email>;
  apiMessages: {
    role: string;
    content: string;
  }[];
  customPrompt: string;
}

export interface generatedNewReplyResponse {
  newAiResponse: string;
  summary: string
}

export interface ReplyEmailPayload {
  subject: string;
  body: string;
  to: string[];
  cc: string[];
  bcc: string[];
  isDraftReply: boolean
}

export interface ChatMessage {
  filename: any | undefined; key: string; value: string
};
export interface PreviousChat {
  _id: string;
  messages: ChatMessage[];
};
