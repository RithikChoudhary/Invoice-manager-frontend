import api from './api';

export interface InviteLink {
  id: string;
  inviter_user_id: string;
  invite_type: 'share_access' | 'add_email_account';
  email_account_id?: string;
  invited_email?: string;
  invite_token: string;
  status: 'active' | 'used' | 'expired';
  expires_at: string;
  used_at?: string;
  used_by_user_id?: string;
  added_email_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInviteRequest {
  email_account_id: string;
  expires_in_hours?: number;
}

export interface CreateEmailAccountInviteRequest {
  invited_email: string;
  expires_in_hours?: number;
}

export interface CreateInviteResponse {
  success: boolean;
  invite_link: InviteLink;
  invite_url: string;
}

export interface AcceptInviteRequest {
  invite_token: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  email_account_id?: string;
}

// Invite API
export const inviteAPI = {
  // Create an invite link
  createInvite: (data: CreateInviteRequest): Promise<CreateInviteResponse> => {
    return api.post('/api/invites/', data).then(res => res.data);
  },

  // Create an email account invite link
  createEmailAccountInvite: (data: CreateEmailAccountInviteRequest): Promise<CreateInviteResponse> => {
    return api.post('/api/invites/email-account', data).then(res => res.data);
  },

  // Get all invite links for the current user
  getAll: () => {
    return api.get('/api/invites/').then(res => res.data);
  },

  // Get a specific invite link
  getById: (id: string) => {
    return api.get(`/api/invites/${id}`).then(res => res.data);
  },

  // Delete an invite link
  delete: (id: string) => {
    return api.delete(`/api/invites/${id}`).then(res => res.data);
  },

  // Accept an invite link
  acceptInvite: (data: AcceptInviteRequest): Promise<AcceptInviteResponse> => {
    return api.post('/api/invites/accept', data).then(res => res.data);
  },

  // Accept an invite link publicly (no authentication required)
  acceptInvitePublic: (data: AcceptInviteRequest): Promise<AcceptInviteResponse> => {
    return api.post('/api/invites/accept-public', data).then(res => res.data);
  },

  // Validate an invite token
  validateToken: (token: string) => {
    return api.get(`/api/invites/validate/${token}`).then(res => res.data);
  }
};

export default inviteAPI; 