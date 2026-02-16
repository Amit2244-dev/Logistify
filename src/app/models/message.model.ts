
export interface MessageType {
  message: string;
  status: MessageStatus;
  icon: string;
}

export type MessageStatus = 'success' | 'error' | 'warning';
