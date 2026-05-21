'use client';

import { Check, Lightbulb } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Agent Profile',    desc: 'Your professional info' },
  { n: 2, label: 'Business Details', desc: 'PAN, bank & GST' },
  { n: 3, label: 'Workspace',        desc: 'Business identity' },
];

interface OnboardingSidebarProps {
  currentStep: 1 | 2 | 3;
  tip?: string;
}

export default function OnboardingSidebar({ currentStep, tip }: OnboardingSidebarProps) {
  const progress = Math.round((currentStep / 3) * 100);

  return (
    <div className="hidden lg:flex w-72 xl:w-80 bg-white border-r border-slate-200 flex-col p-8 shrink-0">
      {/* Logo */}
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

      {/* Progress bar */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Setup Progress</p>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">Step {currentStep} of 3</p>
      </div>

      {/* Step list */}
      <div className="space-y-2 flex-1">
        {STEPS.map((step) => {
          const isCurrent = step.n === currentStep;
          const isDone = step.n < currentStep;
          return (
            <div
              key={step.n}
              className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${isCurrent ? 'bg-blue-50' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : step.n}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isCurrent ? 'text-blue-700' : isDone ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip card */}
      {tip && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-blue-700 text-xs font-semibold">Did you know?</p>
          </div>
          <p className="text-blue-600 text-xs leading-relaxed">{tip}</p>
        </div>
      )}
    </div>
  );
}
