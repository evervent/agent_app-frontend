'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { agentService } from '@/features/agent/services/agent.service';
import OnboardingShell from '@/features/onboarding/components/OnboardingShell';
import FormInput from '@/shared/components/ui/FormInput';
import { Button } from 'ev-ui-lab';

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

  const { handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

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
          <Controller
            name="panNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                label="PAN Number"
                attrName="panNumber"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="ABCDE1234F"
                error={errors.panNumber?.message}
              />
            )}
          />
          <Controller
            name="bankAccountNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Bank Account Number"
                attrName="bankAccountNumber"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="123456789012"
                validationType="NUMBER"
                error={errors.bankAccountNumber?.message}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller
            name="ifscCode"
            control={control}
            render={({ field }) => (
              <FormInput
                label="IFSC Code"
                attrName="ifscCode"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="SBIN0001234"
                error={errors.ifscCode?.message}
              />
            )}
          />
          <Controller
            name="gstNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                label="GST Number"
                attrName="gstNumber"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="22AAAAA0000A1Z5"
                error={errors.gstNumber?.message}
              />
            )}
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
          <Button
            text={skipping ? 'Skipping…' : 'Skip for Now'}
            className="outlinedBtn"
            size="medium"
            onClick={handleSkip}
            loader={skipping}
            disabled={skipping}
          />
          <Button
            text={loading ? 'Saving…' : 'Save & Continue →'}
            className="primaryBtn"
            size="medium"
            onClick={handleSubmit(onSubmit)}
            loader={loading}
            disabled={loading}
          />
        </div>
      </form>
    </OnboardingShell>
  );
}
