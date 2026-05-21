'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/shared/lib/api';
import { AxiosError } from 'axios';
import { CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  password: z.string().regex(/^\d{6}$/, 'MPIN must be exactly 6 digits'),
});

type FormData = z.infer<typeof schema>;

const BENEFITS = [
  { text: 'Smart lead tracking & follow-ups' },
  { text: 'Instant quote generation' },
  { text: 'Real-time earnings dashboard' },
  { text: 'Automated renewal reminders' },
];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/signup', {
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email || undefined,
        password: data.password,
      });
      sessionStorage.setItem('signup_mobile', data.mobile);
      toast.success('OTP sent to +91 ' + data.mobile);
      router.push('/auth/signup/verify');
    } catch (err) {
      const error = err as AxiosError<{ message: string | string[] }>;
      const msg = error.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Something went wrong. Please try again.');
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
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
        <div className="relative z-10">
          <Link href="/welcome" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
                <circle cx="12" cy="13" r="2.5" fill="white"/>
                <path d="M12 6 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Agent App</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-3xl font-bold leading-snug">
              Start your journey as a<br />
              <span className="text-cyan-300">top insurance agent</span>
            </h2>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed">
              Join 2,40,000+ IRDA-licensed agents who run their entire business on Agent App.
            </p>
          </div>
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-blue-100 text-sm">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['bg-emerald-400', 'bg-sky-400', 'bg-violet-400', 'bg-amber-400'].map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-blue-800`} />
            ))}
          </div>
          <p className="text-blue-200 text-xs">2,40,000+ agents trust us</p>
        </div>
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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input {...register('fullName')} placeholder="Ramesh Kumar" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'}`} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
              <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
                <span className="flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-600 text-sm font-medium shrink-0">+91</span>
                <input {...register('mobile')} placeholder="9876543210" inputMode="numeric" maxLength={10} className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none" />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-slate-400 font-normal">(optional)</span></label>
              <input {...register('email')} type="email" placeholder="ramesh@example.com" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">MPIN <span className="text-slate-400 font-normal">(6-digit PIN)</span></label>
              <div className={`flex bg-white border rounded-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${errors.password ? 'border-red-400 ring-1 ring-red-300' : 'border-slate-300'}`}>
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="6-digit MPIN" inputMode="numeric" maxLength={6} className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none rounded-l-xl tracking-widest" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span>{' '}and{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
