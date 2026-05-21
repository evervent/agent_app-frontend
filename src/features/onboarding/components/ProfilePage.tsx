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
import ProductChips from '@/features/onboarding/components/ProductChips';
import { Button } from 'ev-ui-lab';

const IRDA_REGEX = /^IND[0-9]{10,11}$|^IND-[0-9]{4}-[0-9]{6,7}$/;

const schema = z.object({
  irdaLicenseNumber: z
    .string()
    .max(15, 'Max 15 characters')
    .refine((v) => !v || IRDA_REGEX.test(v), { message: 'Invalid IRDA format (e.g. IND-2021-123456)' })
    .optional(),
  agencyName: z.string().max(200).optional(),
  experienceYears: z.string().optional(),
  productLines: z.array(z.string()).min(1, 'Select at least one product line'),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productLines: [] },
  });

  // Pre-fill from saved profile
  useEffect(() => {
    agentService.getMe().then((res) => {
      const p = res.data?.profile;
      if (!p) return;
      reset({
        irdaLicenseNumber: p.irdaLicenseNumber ?? '',
        agencyName: p.agencyName ?? '',
        experienceYears: p.experienceYears != null ? String(p.experienceYears) : '',
        productLines: p.productLines ?? [],
      });
    }).catch(() => { /* silent */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...data,
        experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined,
      };
      await agentService.updateProfile(payload);
      toast.success('Profile saved!');
      router.push('/onboarding/business');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to save profile.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={1}
      title="Your Agent Profile"
      subtitle="Tell us about your insurance career and expertise"
      tip="Agents with complete profiles get 3x more leads from our partner network."
      error={error}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller
            name="irdaLicenseNumber"
            control={control}
            render={({ field }) => (
              <FormInput
                label="IRDA License Number"
                attrName="irdaLicenseNumber"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="IND-2021-1234567"
                maxLength={15}
                error={errors.irdaLicenseNumber?.message}
              />
            )}
          />
          <Controller
            name="agencyName"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Agency / Business Name"
                attrName="agencyName"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Kumar Insurance"
                error={errors.agencyName?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller
            name="experienceYears"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Years of Experience"
                attrName="experienceYears"
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="5"
                validationType="NUMBER"
                error={errors.experienceYears?.message}
              />
            )}
          />
        </div>

        <Controller
          name="productLines"
          control={control}
          render={({ field }) => (
            <ProductChips
              value={field.value}
              onChange={field.onChange}
              error={errors.productLines?.message}
            />
          )}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-400">All fields marked * are required</p>
          <Button
            text={loading ? 'Saving…' : 'Continue →'}
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
