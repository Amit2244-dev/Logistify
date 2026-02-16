export interface InviteUsers {
  orgName: string,
  email: string
  organizationId: string
  vectorStoreId: string
}

export class VerifyInvites {
  token: string | undefined;
}

export interface InvitesMessages {
    message: string
}

export interface OrganizationOption {
  id: string;
  value: string;
  key: string;
  vectorStoreId: string;
}

export interface OrganizationResponse {
  _id: string;
  name: string;
  vectorStoreId: string;
}
