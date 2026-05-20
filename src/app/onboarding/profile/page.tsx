'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { Heart, Car, Zap, ShieldCheck, Plane, Lightbulb, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCT_LINES = [
  { label: 'Health',      Icon: Heart },
  { label: 'Car',         Icon: Car },
  { label: 'Two-Wheeler', Icon: Zap },
  { label: 'Term',        Icon: ShieldCheck },
  { label: 'Travel',      Icon: Plane },
];

const STEPS = [
  { n: 1, label: 'Agent Profile', desc: 'Your professional info' },
  { n: 2, label: 'Business Details', desc: 'PAN, bank & GST' },
  { n: 3, label: 'Workspace', desc: 'Business identity' },
];

const schema = z.object({
  irdaLicenseNumber: z.string().optional(),
  agencyName: z.string().optional(),
  experienceYears: z.string().optional(),
  productLines: z.array(z.string()).min(1, 'Select at least one product line'),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productLines: [] },
  });

  useEffect(() => {
    api.get('/agents/me').then((res) => {
      const p = res.data?.profile;
      if (p) {
        reset({
          irdaLicenseNumber: p.irdaLicenseNumber ?? '',
          agencyName: p.agencyName ?? '',
          experienceYears: p.experienceYears != null ? String(p.experienceYears) : '',
          productLines: p.productLines ?? [],
        });
      }
    }).catch(() => {});
  }, [reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      const payload = { ...data, experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined };
      await api.patch('/agents/profile', payload);
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
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left sidebar — stepper ── */}
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
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '33%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Step 1 of 3</p>
        </div>

        <div className="space-y-2 flex-1">
          {STEPS.map((step) => {
            const isCurrent = step.n === 1;
            const isDone = step.n < 1;
            return (
              <div key={step.n} className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${isCurrent ? 'bg-blue-50' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                  isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
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

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-blue-700 text-xs font-semibold">Did you know?</p>
          </div>
          <p className="text-blue-600 text-xs leading-relaxed">Agents with complete profiles get 3x more leads from our partner network.</p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar (mobile progress) */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Step 1 of 3 — Agent Profile</span>
            <span className="text-xs text-blue-600 font-medium">33%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '33%' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Your Agent Profile</h1>
              <p className="text-slate-500 text-sm mt-1">Tell us about your insurance career and expertise</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    IRDA License Number
                  </label>
                  <input {...register('irdaLicenseNumber')} placeholder="IND-2021-1234567" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Agency / Business Name <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input {...register('agencyName')} placeholder="Kumar Insurance" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select {...register('experienceYears')} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all">
                    <option value="">Select years</option>
                    {Array.from({ length: 51 }, (_, i) => (
                      <option key={i} value={i}>{i === 0 ? 'Less than 1 year' : `${i} year${i > 1 ? 's' : ''}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product lines */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Lines <span className="text-red-500">*</span>
                  <span className="ml-2 text-slate-400 font-normal">Select all that apply</span>
                </label>
                <Controller
                  name="productLines"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2.5">
                      {PRODUCT_LINES.map(({ label, Icon }) => {
                        const selected = field.value.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              const next = selected ? field.value.filter((v) => v !== label) : [...field.value, label];
                              field.onChange(next);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 ${
                              selected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />{label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.productLines && <p className="text-red-500 text-xs mt-2">{errors.productLines.message}</p>}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold px-4 py-3 rounded-xl text-sm transition-all hover:-translate-x-0.5"
                >
                  <span>←</span> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Saving…
                    </>
                  ) : (
                    <>Continue <span>→</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
