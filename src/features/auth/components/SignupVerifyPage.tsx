'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/store/authStore';
import { AuthResponse } from '@/features/auth/types/auth.types';
import { AxiosError } from 'axios';
import OtpInput from '@/features/auth/components/OtpInput';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from 'ev-ui-lab';

export default function SignupVerifyPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const m = sessionStorage.getItem('signup_mobile');
    if (!m) { router.replace('/auth/signup'); return; }
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
      const { data } = await api.post<AuthResponse>('/auth/verify-signup-otp', { mobile, otp });
      setAuth({ agent: data.agent, accessToken: data.accessToken, refreshToken: data.refreshToken, accountType: data.accountType });
      sessionStorage.removeItem('signup_mobile');
      toast.success('Account verified! Setting up your profile…');
      router.push('/onboarding/profile');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Verification failed. Please try again.');
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
      await api.post('/auth/signup', { mobile });
      setCountdown(30);
      setOtp('');
      setResendSuccess(true);
      toast.success('OTP resent!');
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : 'Failed to resend OTP.');
      toast.error(Array.isArray(msg) ? msg[0] : 'Failed to resend OTP.');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold">Check your phone</h2>
            <p className="text-blue-200 text-sm mt-2 leading-relaxed max-w-xs">We&apos;ve sent a 6-digit verification code to protect your account</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">Sending to</p>
            <p className="text-white font-bold text-lg">+91 {mobile}</p>
          </div>
          <p className="text-blue-300 text-xs">OTP valid for 5 minutes · Max 3 attempts</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/auth/signup" className="lg:hidden inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back
          </Link>

          <div className="mb-8 text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verify your mobile</h1>
            <p className="text-slate-500 text-sm mt-1">Enter the 6-digit OTP sent to <span className="font-semibold text-slate-700">+91 {mobile}</span></p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span className="text-sm font-medium">New OTP sent successfully</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-5">
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <Button
            text={loading ? 'Verifying…' : 'Verify & Continue'}
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
