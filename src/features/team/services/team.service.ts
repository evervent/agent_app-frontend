import { api } from '@/shared/lib/api';
import { InviteMemberPayload, UpdateMemberPayload } from '../types/team.types';

export const teamService = {
  getMembers: () => api.get('/workspaces/members'),

  inviteMember: (payload: InviteMemberPayload) =>
    api.post('/workspaces/members', payload),

  updateMember: (memberId: string, payload: UpdateMemberPayload) =>
    api.patch(`/workspaces/members/${memberId}`, payload),

  removeMember: (memberId: string) =>
    api.delete(`/workspaces/members/${memberId}`),

  getRoles: () => api.get('/roles'),
};
