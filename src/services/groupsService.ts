import api from './api';

export interface GoogleGroup {
  _id?: string;          // MongoDB document ID
  user_id: string;
  email_account_id: string;
  group_id: string;      // Google Groups unique identifier
  name: string;
  email: string;
  description?: string;
  member_count: number;
  is_active: boolean;
  connected: boolean;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncGroupsResponse {
  success: boolean;
  message: string;
  groups_count: number;
  synced_count: number;
  groups: any[];
}

export interface SaveSelectedGroupsResponse {
  success: boolean;
  message: string;
  connected_count: number;
  total_groups: number;
}

// Google Groups API
export const groupsAPI = {
  // Get all Google Groups for the current user
  getAll: (emailAccountId?: string) => {
    const params = emailAccountId ? { email_account_id: emailAccountId } : {};
    return api.get('/api/groups/google/db', { params }).then(res => res.data);
  },

  // Sync Google Groups for a specific email account
  syncGroups: (emailAccountId: string): Promise<SyncGroupsResponse> => {
    return api.post('/api/groups/google/sync', { email_account_id: emailAccountId }).then(res => res.data);
  },

  // Save selected groups for an email account
  saveSelectedGroups: (emailAccountId: string, selectedGroupIds: string[]): Promise<SaveSelectedGroupsResponse> => {
    return api.post('/api/groups/google/save-selected', {
      email_account_id: emailAccountId,
      selected_group_ids: selectedGroupIds
    }).then(res => res.data);
  },

  // Get groups from Google (legacy endpoint)
  getGoogleGroups: () => {
    return api.get('/api/groups/google/list').then(res => res.data);
  },

  // Scan specific Google Groups for invoices
  scanGroups: (groupEmails: string[]) => {
    return api.post('/api/groups/google/scan', { group_emails: groupEmails }).then(res => res.data);
  }
};

export default groupsAPI; 