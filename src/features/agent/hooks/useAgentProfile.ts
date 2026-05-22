import { useState, useEffect, useCallback } from 'react';
import { agentService } from '@/features/agent/services/agent.service';
import { AgentProfile, Workspace } from '@/features/agent/types/agent.types';
import { useAuthStore } from '@/shared/store/authStore';

interface UseAgentProfileResult {
  profile: AgentProfile | null;
  workspace: Workspace | null;
  completion: number;
  loading: boolean;
  refetch: () => void;
}

export function useAgentProfile(): UseAgentProfileResult {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);

  const fetchProfile = useCallback(() => {
    setLoading(true);
    agentService.getMe()
      .then((res) => {
        const p: AgentProfile | null = res.data?.profile ?? null;
        const w: Workspace | null = res.data?.workspace ?? null;
        setProfile(p);
        setWorkspace(w);
        setCompletion(p?.profileCompletionPercentage ?? 0);

        // Sync permissions and workspace name from server into auth store
        if (res.data?.permissions || w) {
          setAuth({
            permissions: res.data?.permissions ?? undefined,
            workspaceName: w?.businessName ?? undefined,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setAuth]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, workspace, completion, loading, refetch: fetchProfile };
}
