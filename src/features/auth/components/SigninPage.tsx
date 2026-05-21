'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/shared/store/authStore';
import { AuthResponse } from '@/features/auth/types/auth.types';
import { AxiosError } from 'axios';
import { Smartphone, Lock, Target, RefreshCw, IndianRupee, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const otpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

const passwordSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().regex(/^\d{6}$/, 'MPIN must be exactly 6 digits'),
});

type OtpForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function routeByStep(step: string, router: ReturnType<typeof useRouter>) {
  if (step === 'complete') router.push('/dashboard');
  else if (step === 'profile') router.push('/onboarding/profile');
  else if (step === 'business') router.push('/onboarding/business');
  else if (step === 'workspace') router.push('/onboarding/workspace');
  else router.push('/dashboard');
}

export default function SigninPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<'otp' | 'password'>('otp');
  const [showPassword, setShowPassword] = useState(false);

  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const { register: regOtp, handleSubmit: submitOtp, formState: { errors: otpErrors } } = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  async function onSendOtp(data: OtpForm) {
    setOtpLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/send-otp', { mobile: data.mobile });
      sessionStorage.setItem('signin_mobile', data.mobile);
      toast.success('OTP sent to +91 ' + data.mobile);
      router.push('/auth/signin/verify');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to send OTP.');
      setOtpError(errMsg);
      toast.error(errMsg);
    } finally {
      setOtpLoading(false);
    }
  }

  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const { register: regPw, handleSubmit: submitPw, formState: { errors: pwErrors } } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onSigninPassword(data: PasswordForm) {
    setPwLoading(true);
    setPwError('');
    try {
      const { data: res } = await api.post<AuthResponse>('/auth/signin/password', data);
      setAuth({ agent: res.agent, accessToken: res.accessToken, refreshToken: res.refreshToken });
      toast.success('Welcome back, ' + res.agent.fullName.split(' ')[0] + '!');
      routeByStep(res.onboardingStep, router);
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Invalid mobile or password.');
      setPwError(errMsg);
      toast.error(errMsg);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex-col justify-between p-10 relative overflow-hidden shrink-0"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-60px] w-60 h-60 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>
        <Link href="/welcome" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
              <circle cx="12" cy="13" r="2.5" fill="white"/>
              <path d="M12 6 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Agent App</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-white text-3xl font-bold leading-snug">
              Welcome back to your<br />
              <span className="text-cyan-300">business dashboard</span>
            </h2>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed">
              Your leads, renewals, and earnings are waiting for you.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Active Leads',        value: '—', Icon: Target },
              { label: 'Pending Renewals',    value: '—', Icon: RefreshCw },
              { label: 'This Month Earnings', value: '—', Icon: IndianRupee },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3">
                <stat.Icon className="w-4 h-4 text-blue-300 shrink-0" />
                <div>
                  <p className="text-blue-200 text-xs">{stat.label}</p>
                  <p className="text-white font-bold text-sm">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-400 text-xs">Agent App · IRDA Compliant · Secured with 256-bit encryption</p>
      </motion.div>

      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-50"
      >
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
                <circle cx="12" cy="13" r="2.5" fill="white"/>
              </svg>
            </div>
            <span className="text-slate-800 font-bold text-lg">Agent App</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              New to Agent App?{' '}
              <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">Create a free account</Link>
            </p>
          </div>

          <div className="flex bg-slate-200 rounded-xl p-1 mb-6">
            {(['otp', 'password'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === t ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'otp' ? <><Smartphone className="w-3.5 h-3.5" />OTP Login</> : <><Lock className="w-3.5 h-3.5" />MPIN</>}
              </button>
            ))}
          </div>

          {tab === 'otp' && (
            <form onSubmit={submitOtp(onSendOtp)} className="space-y-5">
              {otpError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-sm">{otpError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                  <span className="flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-600 text-sm font-medium shrink-0">+91</span>
                  <input {...regOtp('mobile')} placeholder="9876543210" inputMode="numeric" maxLength={10} className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none" />
                </div>
                {otpErrors.mobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{otpErrors.mobile.message}</p>}
              </div>
              <button type="submit" disabled={otpLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                {otpLoading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending OTP…</>) : 'Send OTP'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={submitPw(onSigninPassword)} className="space-y-5">
              {pwError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-sm">{pwError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                  <span className="flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-600 text-sm font-medium shrink-0">+91</span>
                  <input {...regPw('mobile')} placeholder="9876543210" inputMode="numeric" maxLength={10} className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none" />
                </div>
                {pwErrors.mobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{pwErrors.mobile.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">MPIN <span className="text-slate-400 font-normal">(6-digit PIN)</span></label>
                <div className="flex bg-white border border-slate-300 rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <input {...regPw('password')} type={showPassword ? 'text' : 'password'} placeholder="6-digit MPIN" inputMode="numeric" maxLength={6} className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none rounded-l-xl tracking-widest" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwErrors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{pwErrors.password.message}</p>}
              </div>
              <button type="submit" disabled={pwLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                {pwLoading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>) : 'Sign In'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
