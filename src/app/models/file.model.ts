export interface FileResponse {
  data: [];
  total: number;
}

export interface signedResponse {
  signedUrl: string
}

export interface FileVectorAiResponse {
  text: string;
  data: { filename: string[] };
}

export interface FileVectorAiRequest {
  prompt: string;
  isNew: Boolean;
}


export interface FileQueryParams {
  sortOrder: string;
  sortBy: string;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  search: string;
}

export interface ViewFile {
  s3FileName?: string;
  fileName?: string;
  aiGeneratedResponse?: string
}
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;
}