import { api } from '@/shared/lib/api';

export interface WorkspaceMemberItem {
  id: string;
  agentId: string;
  agent: {
    id: string;
    fullName: string;
    mobile: string;
  };
}

export const workspaceMembersService = {
  list: () => api.get<WorkspaceMemberItem[]>('/workspaces/members'),
};
