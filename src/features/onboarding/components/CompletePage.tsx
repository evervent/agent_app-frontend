'use client';

import Link from 'next/link';
import { useAuthStore } from '@/shared/store/authStore';
import { Target, FileText, Users, Bell, ArrowRight, Star } from 'lucide-react';

const NEXT_STEPS = [
  { Icon: Target,   title: 'Add your first lead',  desc: 'Start building your pipeline',        color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  { Icon: FileText, title: 'Create a quote',        desc: 'Generate instant quotes for clients', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  { Icon: Users,    title: 'Invite a sub-agent',    desc: 'Grow your team',                      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { Icon: Bell,     title: 'Set up renewals',       desc: 'Never miss a renewal again',          color: 'text-amber-400',   bg: 'bg-amber-500/10' },
];

export default function CompletePage() {
  const agent = useAuthStore((s) => s.agent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/30 scale-125 animate-ping" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            You&apos;re all set{agent?.fullName ? `, ${agent.fullName.split(' ')[0]}` : ''}! 🎉
          </h1>
          <p className="text-blue-200 text-base max-w-md mx-auto">
            Your Agent App workspace is live. Welcome to India&apos;s most powerful insurance business platform.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: '2.4L+', label: 'Agents Joined' },
            { value: '₹840Cr+', label: 'Premium Managed' },
            { value: '4.8', label: 'App Rating', star: true },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl py-4 text-center backdrop-blur-sm">
              <div className="text-white font-bold text-xl flex items-center justify-center gap-1">
                {s.value}
                {'star' in s && s.star && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
              </div>
              <div className="text-blue-300 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-sm mb-8">
          <p className="text-blue-200 text-sm font-semibold mb-4 uppercase tracking-wider">Recommended Next Steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEXT_STEPS.map((step) => (
              <div key={step.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-all cursor-default group">
                <div className={`w-9 h-9 ${step.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <step.Icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{step.title}</p>
                  <p className="text-blue-300 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 font-bold py-4 rounded-2xl text-base shadow-2xl shadow-blue-900/50 hover:bg-blue-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
