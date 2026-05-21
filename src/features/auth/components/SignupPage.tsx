'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/shared/lib/api';
import { AxiosError } from 'axios';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { TextInputField, Button } from 'ev-ui-lab';

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

  const [form, setForm] = useState({ fullName: '', mobile: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  function update(attr: string, val: string) {
    setForm((prev) => ({ ...prev, [attr]: val }));
    setFormErrors((prev) => ({ ...prev, [attr]: undefined }));
  }

  async function handleSubmit() {
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Partial<Record<keyof typeof form, string>> = {};
      result.error.issues.forEach((e) => { const key = e.path[0]; if (key && typeof key === 'string') errs[key as keyof typeof form] = e.message; });
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/signup', {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email || undefined,
        password: form.password,
      });
      sessionStorage.setItem('signup_mobile', form.mobile);
      toast.success('OTP sent to +91 ' + form.mobile);
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

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <TextInputField
              title="Full Name"
              value={form.fullName}
              attrName="fullName"
              value_update={update}
              validation_type="NAME"
              required={true}
              placeholder="Ramesh Kumar"
              warn_status={!!formErrors.fullName}
              error_message={formErrors.fullName}
            />

            <TextInputField
              title="Mobile Number"
              value={form.mobile}
              attrName="mobile"
              value_update={update}
              validation_type="MOBILE"
              required={true}
              placeholder="9876543210"
              max_length={10}
              warn_status={!!formErrors.mobile}
              error_message={formErrors.mobile}
            />

            <TextInputField
              title="Email (optional)"
              value={form.email}
              attrName="email"
              value_update={update}
              placeholder="ramesh@example.com"
              warn_status={!!formErrors.email}
              error_message={formErrors.email}
            />

            <TextInputField
              title="MPIN (6-digit PIN)"
              value={form.password}
              attrName="password"
              value_update={update}
              validation_type="PASSWORD"
              required={true}
              placeholder="6-digit MPIN"
              max_length={6}
              warn_status={!!formErrors.password}
              error_message={formErrors.password}
            />

            <Button
              text={loading ? 'Creating account…' : 'Create Account'}
              className="primaryBtn"
              size="large"
              onClick={handleSubmit}
              fullWidth={true}
              loader={loading}
              disabled={loading}
            />

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
