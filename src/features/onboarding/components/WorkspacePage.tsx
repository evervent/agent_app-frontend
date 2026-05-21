'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { agentService } from '@/features/agent/services/agent.service';
import OnboardingShell from '@/features/onboarding/components/OnboardingShell';
import FormInput from '@/shared/components/ui/FormInput';
import SearchSelect from '@/shared/components/ui/SearchSelect';
import ProductChips from '@/features/onboarding/components/ProductChips';
import TeamTypeSelector from '@/features/onboarding/components/TeamTypeSelector';
import { useCountryData } from '@/features/onboarding/hooks/useCountryData';

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  productInterests: z.array(z.string()).min(1, 'Select at least one product'),
  teamType: z.enum(['solo', 'team']),
});

type FormData = z.infer<typeof schema>;

export default function WorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { states, cities, citiesLoading, loadCities } = useCountryData();

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productInterests: [], teamType: 'solo' },
  });

  const watchedState = watch('state');
  useEffect(() => { loadCities(watchedState); }, [watchedState]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      await agentService.setupWorkspace(data);
      toast.success('Workspace created! Welcome aboard 🎉');
      router.push('/onboarding/complete');
    } catch (err) {
      const e = err as AxiosError<{ message: string | string[] }>;
      const msg = e.response?.data?.message;
      const errMsg = Array.isArray(msg) ? msg[0] : (msg ?? 'Failed to create workspace.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell
      step={3}
      title="Set Up Your Workspace"
      subtitle="Define your business identity and team structure"
      tip="You're almost there. Set up your workspace to start managing your business."
      error={error}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          {...register('businessName')}
          label="Business Name"
          placeholder="Kumar Insurance Agency"
          required
          error={errors.businessName?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="State"
                options={states}
                value={field.value}
                onChange={(v) => { field.onChange(v); }}
                placeholder="Search state…"
                required
                error={errors.state?.message}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="City"
                options={cities}
                value={field.value}
                onChange={field.onChange}
                placeholder="Search city…"
                required
                loading={citiesLoading}
                disabled={!watchedState}
                error={errors.city?.message}
              />
            )}
          />
        </div>

        <Controller
          name="productInterests"
          control={control}
          render={({ field }) => (
            <ProductChips
              label="Products You Sell"
              value={field.value}
              onChange={field.onChange}
              error={errors.productInterests?.message}
            />
          )}
        />

        <Controller
          name="teamType"
          control={control}
          render={({ field }) => (
            <TeamTypeSelector
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-400">Fields marked * are required</p>
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
                Setting up…
              </>
            ) : <><Rocket className="w-4 h-4" />Launch My Workspace</>}
          </button>
        </div>
      </form>
    </OnboardingShell>
  );
}
