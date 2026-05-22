'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/store/authStore';
import { api } from '@/shared/lib/api';
import { AuthResponse } from '@/features/auth/types/auth.types';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

function routeByStep(step: string, router: ReturnType<typeof useRouter>) {
  if (step === 'complete') router.push('/dashboard');
  else if (step === 'profile') router.push('/onboarding/profile');
  else if (step === 'business') router.push('/onboarding/business');
  else if (step === 'workspace') router.push('/onboarding/workspace');
  else router.push('/dashboard');
}

export default function ContextSelectPage() {
  const router = useRouter();
  const { pendingContexts, preAuthToken, agent, accessToken, setAuth, clearAuth } = useAuthStore();
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    // Only redirect to signin if we have no pending contexts AND no active session
    // (avoids redirect when setAuth clears pendingContexts after workspace selection)
    if (!pendingContexts && !preAuthToken && !accessToken) {
      router.replace('/auth/signin');
    }
  }, [pendingContexts, preAuthToken, accessToken, router]);

  // Show list while we have contexts; show nothing (no flash) while navigating away
  if (!pendingContexts || !preAuthToken || !agent) return null;

  async function handleSelect(workspaceId: string) {
    setSelecting(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/select-context', {
        preAuthToken,
        workspaceId,
      });
      setAuth({ agent: data.agent, accessToken: data.accessToken, refreshToken: data.refreshToken, accountType: data.accountType });
      toast.success('Workspace selected.');
      routeByStep(data.onboardingStep, router);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to select workspace.'));
      setSelecting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Choose Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">
            You belong to multiple workspaces. Select one to continue.
          </p>
        </div>

        <div className="space-y-3">
          {pendingContexts.map((ctx) => (
            <button
              key={ctx.workspaceId}
              onClick={() => handleSelect(ctx.workspaceId)}
              disabled={selecting}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                  {ctx.workspaceName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{ctx.role}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  ctx.type === 'owner'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {ctx.type === 'owner' ? 'Owner' : 'Member'}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { clearAuth(); router.push('/auth/signin'); }}
          className="mt-6 w-full text-sm text-gray-400 hover:text-gray-600 text-center"
        >
          Sign in with a different account
        </button>
      </div>
    </div>
  );
}
