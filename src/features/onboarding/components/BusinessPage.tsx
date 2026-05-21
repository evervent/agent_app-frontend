'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { agentService } from '@/features/agent/services/agent.service';
import OnboardingShell from '@/features/onboarding/components/OnboardingShell';
import FormInput from '@/shared/components/ui/FormInput';

const schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  bankAccountNumber: z.string().max(30).optional().or(z.literal('')),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g. SBIN0001234)').optional().or(z.literal('')),
  gstNumber: z.string().max(20).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function BusinessPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Pre-fill from saved profile
  useEffect(() => {
    agentService.getMe().then((res) => {
      const p = res.data?.profile;
      if (!p) return;
      reset({
        panNumber: p.panNumber ?? '',
        bankAccountNumber: p.bankAccountNumber ?? '',
        ifscCode: p.ifscCode ?? '',
        gstNumber: p.gstNumber ?? '',
      });
    }).catch(() => { /* silent */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v && v !== ''));
    try {
      await agentService.updateBusinessDetails(cleaned);
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
    try { await agentService.updateBusinessDetails({}); } catch { /* ignore */ }
    finally { setSkipping(false); router.push('/onboarding/workspace'); }
  }

  return (
    <OnboardingShell
      step={2}
      title="Business Details"
      subtitle="Required for payouts & compliance. You can skip and add later."
      error={error}
    >
      <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p className="text-blue-700 text-xs">All fields are optional. Leave blank to skip individual fields.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            {...register('panNumber')}
            label="PAN Number"
            placeholder="ABCDE1234F"
            error={errors.panNumber?.message}
          />
          <FormInput
            {...register('bankAccountNumber')}
            label="Bank Account Number"
            placeholder="123456789012"
            inputMode="numeric"
            error={errors.bankAccountNumber?.message}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            {...register('ifscCode')}
            label="IFSC Code"
            placeholder="SBIN0001234"
            error={errors.ifscCode?.message}
          />
          <FormInput
            {...register('gstNumber')}
            label="GST Number"
            placeholder="22AAAAA0000A1Z5"
            error={errors.gstNumber?.message}
          />
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.push('/onboarding/profile')}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors mr-auto"
          >
            ← Back
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
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving…
              </>
            ) : <>Save & Continue <span>→</span></>}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
