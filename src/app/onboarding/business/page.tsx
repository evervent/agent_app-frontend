'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { Lock, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { n: 1, label: 'Agent Profile', desc: 'Your professional info' },
  { n: 2, label: 'Business Details', desc: 'PAN, bank & GST' },
  { n: 3, label: 'Workspace', desc: 'Business identity' },
];

const schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  bankAccountNumber: z.string().regex(/^[0-9]{9,18}$/, 'Invalid account number (9-18 digits)').optional().or(z.literal('')),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g. SBIN0001234)').optional().or(z.literal('')),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g. 22AAAAA0000A1Z5)').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get('/agents/me').then((res) => {
      const p = res.data?.profile;
      if (p) {
        reset({
          panNumber: p.panNumber ?? '',
          bankAccountNumber: p.bankAccountNumber ?? '',
          ifscCode: p.ifscCode ?? '',
          gstNumber: p.gstNumber ?? '',
        });
      }
    }).catch(() => {});
  }, [reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v && v !== ''));
    try {
      await api.patch('/agents/business-details', cleaned);
      toast.success('Business details saved!');
      router.push('/onboarding/workspace');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to save.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setSkipping(true);
    try { await api.patch('/agents/business-details', {}); } catch { /* ignore */ }
    finally { setSkipping(false); router.push('/onboarding/workspace'); }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:flex w-72 xl:w-80 bg-white border-r border-slate-200 flex-col p-8 shrink-0">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
              <circle cx="12" cy="13" r="2.5" fill="white"/>
              <path d="M12 6 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-slate-800 font-bold">Agent App</span>
        </div>
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Setup Progress</p>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '66%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Step 2 of 3</p>
        </div>
        <div className="space-y-2 flex-1">
          {STEPS.map((step) => {
            const isCurrent = step.n === 2;
            const isDone = step.n < 2;
            return (
              <div key={step.n} className={`flex items-start gap-3 px-3 py-3 rounded-xl ${isCurrent ? 'bg-blue-50' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.n}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-blue-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</p>
                  <p className={`text-xs mt-0.5 ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-amber-700 text-xs font-semibold">Business Details</p>
          </div>
          <p className="text-amber-600 text-xs leading-relaxed">All fields are optional. You can add or update them later.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Step 2 of 3 — Business Details</span>
            <span className="text-xs text-blue-600 font-medium">66%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Business Details</h1>
              <p className="text-slate-500 text-sm mt-1">Required for payouts &amp; compliance. You can skip and add later.</p>
            </div>

            <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-blue-700 text-xs">All fields are optional. Leave blank to skip individual fields.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">PAN Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input {...register('panNumber')} placeholder="ABCDE1234F" maxLength={10} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm uppercase placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.panNumber ? 'border-red-400' : 'border-slate-300'}`} />
                  {errors.panNumber && <p className="text-red-500 text-xs mt-1.5">{errors.panNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Account Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input {...register('bankAccountNumber')} placeholder="123456789012" inputMode="numeric" maxLength={18} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
                  {errors.bankAccountNumber && <p className="text-red-500 text-xs mt-1.5">{errors.bankAccountNumber.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input {...register('ifscCode')} placeholder="SBIN0001234" maxLength={11} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm uppercase placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.ifscCode ? 'border-red-400' : 'border-slate-300'}`} />
                  {errors.ifscCode && <p className="text-red-500 text-xs mt-1.5">{errors.ifscCode.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">GST Number <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input {...register('gstNumber')} placeholder="22AAAAA0000A1Z5" maxLength={15} className={`w-full bg-white border rounded-xl px-4 py-3 text-sm uppercase placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.gstNumber ? 'border-red-400' : 'border-slate-300'}`} />
                  {errors.gstNumber && <p className="text-red-500 text-xs mt-1.5">{errors.gstNumber.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold px-4 py-3 rounded-xl text-sm transition-all hover:-translate-x-0.5"
                >
                  <span>←</span> Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={skipping}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-600 font-semibold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {skipping ? 'Skipping…' : 'Skip for Now'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                  ) : <>Save & Continue <span>→</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

