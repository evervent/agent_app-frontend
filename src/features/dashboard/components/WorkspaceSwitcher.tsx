'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronDown, Check, Loader2, Plus, Crown, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/shared/store/authStore';
import { ContextItem } from '@/features/auth/types/auth.types';

interface SwitchWorkspaceResponse {
  accessToken: string;
  refreshToken: string;
  accountType: 'owner' | 'member' | 'guest';
  onboardingStep: string;
}

export default function WorkspaceSwitcher() {
  const router = useRouter();
  const workspaceName = useAuthStore((s) => s.workspaceName);
  const accountType = useAuthStore((s) => s.accountType);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  // Decode current workspaceId from JWT
  const currentWorkspaceId = (() => {
    if (!accessToken) return undefined;
    try {
      const payload = accessToken.split('.')[1];
      return JSON.parse(atob(payload)).workspaceId as string | undefined;
    } catch {
      return undefined;
    }
  })();

  const [open, setOpen] = useState(false);
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [loadingContexts, setLoadingContexts] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Fetch contexts when dropdown opens
  useEffect(() => {
    if (!open) return;
    setLoadingContexts(true);
    api.get<{ contexts: ContextItem[] }>('/auth/contexts')
      .then((res) => setContexts(res.data.contexts))
      .catch(() => setContexts([]))
      .finally(() => setLoadingContexts(false));
  }, [open]);



  async function handleSwitch(ctx: ContextItem) {
    if (ctx.workspaceId === currentWorkspaceId) {
      setOpen(false);
      return;
    }
    setSwitchingId(ctx.workspaceId);
    try {
      const res = await api.post<SwitchWorkspaceResponse>('/auth/switch-workspace', {
        workspaceId: ctx.workspaceId,
      });
      setAuth({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        accountType: res.data.accountType,
        workspaceName: ctx.workspaceName,
        // permissions will be refreshed by useAgentProfile on next render
      });
      setOpen(false);
      // Refresh the page so all queries re-run with new token
      router.refresh();
    } catch {
      // silent fail — keep dropdown open
    } finally {
      setSwitchingId(null);
    }
  }

  function handleCreateOwn() {
    setOpen(false);
    // `?create=true` signals WorkspacePage to skip the member redirect and return to dashboard after creation
    router.push('/onboarding/workspace?create=true');
  }

  const ownsAWorkspace = contexts.some((c) => c.type === 'owner');
  const displayName = workspaceName ?? 'My Workspace';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 max-w-[180px] group"
        title={displayName}
      >
        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">{displayName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Workspaces</p>
            </div>

            {/* Contexts list */}
            <div className="py-1.5 max-h-56 overflow-y-auto">
              {loadingContexts ? (
                <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading…</span>
                </div>
              ) : contexts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No workspaces found</p>
              ) : (
                contexts.map((ctx) => {
                  const isActive = ctx.workspaceId === currentWorkspaceId;
                  const isSwitching = switchingId === ctx.workspaceId;
                  return (
                    <button
                      key={ctx.workspaceId}
                      onClick={() => handleSwitch(ctx)}
                      disabled={!!switchingId}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50 disabled:opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      >
                        {ctx.type === 'owner' ? (
                          <Crown className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-amber-500'}`} />
                        ) : (
                          <Users className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                          {ctx.workspaceName}
                        </p>
                        <p className={`text-[11px] mt-0.5 capitalize ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                          {ctx.role} • {ctx.type}
                        </p>
                      </div>
                      {isSwitching ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                      ) : isActive ? (
                        <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            {/* Create own workspace — shown only for members who don't own any workspace */}
            {!loadingContexts && accountType === 'member' && !ownsAWorkspace && (
              <div className="border-t border-slate-100 py-1.5">
                <button
                  onClick={handleCreateOwn}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Create My Own Workspace</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Start your own agency</p>
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
