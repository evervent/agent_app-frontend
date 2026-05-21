'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 40);
    const timer = setTimeout(() => {
      clearInterval(interval);
      router.replace('/welcome');
    }, 2200);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div className="absolute top-[-120px] right-[-120px] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center gap-8 px-8">
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40">
            <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12">
              <rect width="40" height="40" rx="10" fill="#2563eb"/>
              <path d="M20 8 L30 14 L30 26 L20 32 L10 26 L10 14 Z" fill="white" opacity="0.15"/>
              <path d="M20 12 L27 16.5 L27 25.5 L20 30 L13 25.5 L13 16.5 Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="21" r="3.5" fill="white"/>
              <path d="M20 14 L20 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2.5 h-2.5 bg-white rounded-full"/>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-white text-4xl font-bold tracking-tight">Agent App</h1>
          <p className="text-blue-200 text-base font-medium">India&apos;s #1 Insurance Business Platform</p>
        </div>

        <div className="w-48 mt-4">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-6 mt-2">
          {['2.4L+ Agents', 'IRDA Compliant', 'Secure'].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-blue-200 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
