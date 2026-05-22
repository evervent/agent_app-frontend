import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Agent, ContextItem } from '@/features/auth/types/auth.types';

interface AuthState {
  agent: Agent | null;
  accessToken: string | null;
  refreshToken: string | null;
  accountType: 'owner' | 'member' | 'guest' | null;
  permissions: string[]; // e.g. ['leads.create', 'leads.read'] or ['*'] for owner
  workspaceName: string | null;
  pendingContexts: ContextItem[] | null;
  preAuthToken: string | null;
  setAuth: (data: { agent?: Agent; accessToken?: string; refreshToken?: string; accountType?: 'owner' | 'member' | 'guest'; permissions?: string[]; workspaceName?: string }) => void;
  setPendingContexts: (contexts: ContextItem[], preAuthToken: string, agent: Agent) => void;
  clearAuth: () => void;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      agent: null,
      accessToken: null,
      refreshToken: null,
      accountType: null,
      permissions: [],
      workspaceName: null,
      pendingContexts: null,
      preAuthToken: null,
      setAuth: (data) => {
        if (data.accessToken) setCookie('agent-access-token', data.accessToken, 1);
        set((state) => ({
          agent: data.agent !== undefined ? data.agent : state.agent,
          accessToken: data.accessToken !== undefined ? data.accessToken : state.accessToken,
          refreshToken: data.refreshToken !== undefined ? data.refreshToken : state.refreshToken,
          accountType: data.accountType !== undefined ? data.accountType : state.accountType,
          permissions: data.permissions !== undefined ? data.permissions : state.permissions,
          workspaceName: data.workspaceName !== undefined ? data.workspaceName : state.workspaceName,
          pendingContexts: null,
          preAuthToken: null,
        }));
      },
      setPendingContexts: (contexts, preAuthToken, agent) => {
        set({ pendingContexts: contexts, preAuthToken, agent });
      },
      clearAuth: () => {
        deleteCookie('agent-access-token');
        set({ agent: null, accessToken: null, refreshToken: null, accountType: null, permissions: [], workspaceName: null, pendingContexts: null, preAuthToken: null });
      },
    }),
    {
      name: 'agent-auth',
    },
  ),
);
