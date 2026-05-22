'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/store/authStore';
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

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const token = searchParams.get('token') ?? '';

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid invite link.');
      router.replace('/auth/signin');
    }
  }, [token, router]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleResendOtp() {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number first.');
      return;
    }
    setResending(true);
    setError('');
    try {
      await api.post('/auth/resend-invite-otp', { token, mobile });
      toast.success('New OTP sent to your mobile.');
      setResendCooldown(60);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to resend OTP.'));
    } finally {
      setResending(false);
    }
  }

  async function handleAccept() {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your mobile.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AuthResponse>('/auth/accept-invite', { token, mobile, otp });
      setAuth({ agent: data.agent, accessToken: data.accessToken, refreshToken: data.refreshToken, accountType: data.accountType });
      toast.success("You've joined the workspace!");
      routeByStep(data.onboardingStep, router);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to accept invite.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Accept Invite</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your mobile and the OTP to join the workspace.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
            />
          </div>

          {/* OTP */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">OTP</label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || resendCooldown > 0}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {resending
                  ? 'Sending…'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit OTP"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm tracking-widest text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              OTP was sent to your mobile when the invite was created.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-amber-600 mt-1">
                Dev: use <span className="font-mono font-bold">000000</span> to bypass OTP
              </p>
            )}
          </div>

          <button
            onClick={handleAccept}
            disabled={loading || mobile.length !== 10 || otp.length !== 6}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Joining workspace…' : 'Join Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}

