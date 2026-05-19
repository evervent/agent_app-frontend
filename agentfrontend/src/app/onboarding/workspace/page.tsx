'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { Heart, Car, Zap, ShieldCheck, Plane, User, Users, Check, CheckCircle2, AlertCircle, Rocket, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const PRODUCT_INTERESTS = [
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
  businessName: z.string().min(1, 'Business name is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  productInterests: z.array(z.string()).min(1, 'Select at least one product'),
  teamType: z.enum(['solo', 'team']),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { productInterests: [], teamType: 'solo' },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      await api.post('/agents/workspace', data);
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
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '99%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Step 3 of 3 — Almost done!</p>
        </div>
        <div className="space-y-2 flex-1">
          {STEPS.map((step) => {
            const isCurrent = step.n === 3;
            const isDone = step.n < 3;
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
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <p className="text-emerald-700 text-xs font-semibold">Last Step!</p>
          </div>
          <p className="text-emerald-600 text-xs leading-relaxed">You&apos;re almost there. Set up your workspace to start managing your business.</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Step 3 of 3 — Workspace</span>
            <span className="text-xs text-blue-600 font-medium">99%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '99%' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Set Up Your Workspace</h1>
              <p className="text-slate-500 text-sm mt-1">Define your business identity and team structure</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name <span className="text-red-500">*</span></label>
                <input {...register('businessName')} placeholder="Kumar Insurance Agency" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.businessName ? 'border-red-400' : 'border-slate-300'}`} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1.5">{errors.businessName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input {...register('city')} placeholder="Mumbai" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.city ? 'border-red-400' : 'border-slate-300'}`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      {...register('state')}
                      className={`w-full bg-white border rounded-xl px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all appearance-none pr-10 ${errors.state ? 'border-red-400 text-slate-900' : 'border-slate-300 text-slate-900'}`}
                    >
                      <option value="" className="text-slate-400">Select state...</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.state && <p className="text-red-500 text-xs mt-1.5">{errors.state.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Products You Sell <span className="text-red-500">*</span></label>
                <Controller
                  name="productInterests"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2.5">
                      {PRODUCT_INTERESTS.map(({ label, Icon }) => {
                        const selected = field.value.includes(label);
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              const next = selected ? field.value.filter((v) => v !== label) : [...field.value, label];
                              field.onChange(next);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 ${selected ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'}`}
                          >
                            <Icon className="w-3.5 h-3.5" />{label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.productInterests && <p className="text-red-500 text-xs mt-2">{errors.productInterests.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">How do you operate?</label>
                <Controller
                  name="teamType"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'solo', label: 'Solo Agent', desc: 'I work independently', Icon: User },
                        { value: 'team', label: 'With a Team', desc: 'I manage sub-agents',  Icon: Users },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`relative flex flex-col items-start gap-2 py-4 px-4 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 ${field.value === opt.value ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-600/15' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${field.value === opt.value ? 'bg-blue-600' : 'bg-slate-100'}`}>
                            <opt.Icon className={`w-4 h-4 ${field.value === opt.value ? 'text-white' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${field.value === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                          </div>
                          {field.value === opt.value && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-400">Fields marked * are required</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Setting up…</>
                  ) : <><Rocket className="w-4 h-4" />Launch My Workspace</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
