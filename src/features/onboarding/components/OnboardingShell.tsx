'use client';

import { AlertCircle } from 'lucide-react';
import OnboardingSidebar from './OnboardingSidebar';

interface OnboardingShellProps {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  tip?: string;
  error?: string;
  children: React.ReactNode;
}

export default function OnboardingShell({ step, title, subtitle, tip, error, children }: OnboardingShellProps) {
  const progress = Math.round((step / 3) * 100);
  const stepLabels: Record<number, string> = {
    1: 'Agent Profile',
    2: 'Business Details',
    3: 'Workspace',
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <OnboardingSidebar currentStep={step} tip={tip} />

      <div className="flex-1 flex flex-col">
        {/* Mobile progress bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Step {step} of 3 — {stepLabels[step]}
            </span>
            <span className="text-xs text-blue-600 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
