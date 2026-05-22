'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/store/authStore';
import { SigninResponse } from '@/features/auth/types/auth.types';
import { AxiosError } from 'axios';
import OtpInput from '@/features/auth/components/OtpInput';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from 'ev-ui-lab';

export default function SigninVerifyPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPendingContexts = useAuthStore((s) => s.setPendingContexts);

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const m = sessionStorage.getItem('signin_mobile');
    if (!m) { router.replace('/auth/signin'); return; }
    setMobile(m);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  async function handleVerify() {
    if (otp.length !== 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<SigninResponse>('/auth/signin/otp', { mobile, otp });
      sessionStorage.removeItem('signin_mobile');
      if ('requiresContextSelection' in data && data.requiresContextSelection) {
        setPendingContexts(data.contexts, data.preAuthToken, data.agent);
        router.push('/auth/context-select');
        return;
      }      const authData = data as import('@/features/auth/types/auth.types').AuthResponse;
      setAuth({ agent: authData.agent, accessToken: authData.accessToken, refreshToken: authData.refreshToken, accountType: authData.accountType });
      toast.success('Welcome back, ' + authData.agent.fullName.split(' ')[0] + '!');
      const step = authData.onboardingStep;
      if (step === 'complete') router.push('/dashboard');
      else if (step === 'profile') router.push('/onboarding/profile');
      else if (step === 'business') router.push('/onboarding/business');
      else if (step === 'workspace') router.push('/onboarding/workspace');
      else router.push('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Verification failed.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    setResendSuccess(false);
    try {
      await api.post('/auth/send-otp', { mobile });
      setCountdown(30);
      setOtp('');
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex-col justify-center items-center p-10 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-60px] w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/15 border border-white/20 rounded-3xl flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Almost there!</h2>
            <p className="text-blue-200 text-sm mt-2 leading-relaxed max-w-xs">
              Enter the verification code to securely access your account
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">OTP sent to</p>
            <p className="text-white font-bold text-lg">+91 {mobile}</p>
          </div>
          <p className="text-blue-300 text-xs">OTP valid for 5 minutes · Secured with 256-bit encryption</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/auth/signin" className="lg:hidden inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back
          </Link>

          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Enter your OTP</h1>
            <p className="text-slate-500 text-sm mt-1">
              6-digit code sent to <span className="font-semibold text-slate-700">+91 {mobile}</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium">New OTP sent successfully</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-5">
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <Button
            text={loading ? 'Verifying…' : 'Verify & Sign In'}
            className="primaryBtn"
            size="large"
            onClick={handleVerify}
            loader={loading}
            disabled={loading || otp.length < 6}
            fullWidth={true}
          />

          <div className="text-center mt-5 text-sm text-slate-500">
            {countdown > 0 ? (
              <span>Resend OTP in <span className="font-semibold text-blue-600 tabular-nums">{countdown}s</span></span>
            ) : (
              <Button
                text={resending ? 'Sending…' : 'Resend OTP'}
                className="textBtn"
                size="small"
                onClick={handleResend}
                loader={resending}
                disabled={resending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
