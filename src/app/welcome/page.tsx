'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, FileText, Shield, RefreshCw, IndianRupee, Building2, Star } from 'lucide-react';

const FEATURES = [
  { Icon: Users,       label: 'Leads',    desc: 'Track & convert',      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  { Icon: FileText,    label: 'Quotes',   desc: 'Instant generation',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  { Icon: Shield,      label: 'Policies', desc: 'Full lifecycle',       color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { Icon: RefreshCw,   label: 'Renewals', desc: 'Auto reminders',       color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { Icon: IndianRupee, label: 'Earnings', desc: 'Commission tracking',  color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
  { Icon: Building2,   label: 'Team',     desc: 'Sub-agent network',    color: 'text-amber-400',  bg: 'bg-amber-500/10' },
];

const STATS = [
  { value: '2.4L+', label: 'IRDA Agents' },
  { value: '₹840Cr+', label: 'Premium Managed' },
  { value: '4.8', label: 'App Rating', star: true },
];

export default function WelcomePage() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex flex-col overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-between px-8 py-5 lg:px-16"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.1"/>
              <circle cx="12" cy="13" r="2.5" fill="white"/>
              <path d="M12 6 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Agent App</span>
          <span className="hidden sm:block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
            IRDA Certified
          </span>
        </div>
        <Link
          href="/auth/signin"
          className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
        >
          Sign In
        </Link>
      </motion.nav>

      {/* Main hero content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-blue-200 text-xs font-semibold tracking-wide uppercase">
            Trusted by 2,40,000+ Licensed Agents
          </span>
        </motion.div>

        <motion.h1 {...fadeUp(0.2)} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
          Run Your Entire{' '}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Insurance Business
          </span>{' '}
          From One Platform
        </motion.h1>

        <motion.p {...fadeUp(0.3)} className="mt-5 text-blue-200 text-base sm:text-lg max-w-xl leading-relaxed">
          Manage leads, quotes, policies, renewals, team &amp; earnings — all in one place.
          Built exclusively for IRDA-licensed agents across India.
        </motion.p>

        {/* Stats */}
        <motion.div {...fadeUp(0.4)} className="flex items-center gap-8 mt-8 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-white font-bold text-xl sm:text-2xl flex items-center justify-center gap-1">
                {s.value}
                {'star' in s && s.star && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              </div>
              <div className="text-blue-300 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Link
            href="/auth/signup"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl text-base shadow-xl shadow-blue-900/50 transition-all hover:shadow-blue-700/40 hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Create Free Account
          </Link>
          <Link
            href="/auth/signin"
            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-8 rounded-xl text-base transition-all hover:-translate-y-0.5 text-center"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.p {...fadeUp(0.55)} className="mt-3 text-blue-400 text-xs">Free to start · No credit card required</motion.p>
      </main>

      {/* Features grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.6 } } }}
        className="relative z-10 px-6 pb-10 lg:px-16 max-w-4xl mx-auto w-full"
      >
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 text-center cursor-default"
            >
              <div className={`w-9 h-9 ${f.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <f.Icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <div className="text-white text-xs font-semibold">{f.label}</div>
              <div className="text-blue-400 text-[10px] mt-0.5 hidden sm:block">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
