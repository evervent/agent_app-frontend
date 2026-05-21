import { api } from '@/shared/lib/api';
import {
  UpdateProfilePayload,
  UpdateBusinessPayload,
  SetupWorkspacePayload,
} from '@/features/agent/types/agent.types';

export const agentService = {
  /** Get current agent with profile + workspace */
  getMe: () =>
    api.get('/agents/me'),

  /** Update agent profile (step 1 onboarding + profile edit) */
  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch('/agents/profile', payload),

  /** Update business/financial details (step 2 onboarding) */
  updateBusinessDetails: (payload: UpdateBusinessPayload) =>
    api.patch('/agents/business-details', payload),

  /** Setup workspace (step 3 onboarding) */
  setupWorkspace: (payload: SetupWorkspacePayload) =>
    api.post('/agents/workspace', payload),
};
