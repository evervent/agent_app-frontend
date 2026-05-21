'use client';

import { useAuthStore } from '@/shared/store/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamPage } from '@/features/team';
import {
  LayoutDashboard, Users, FileText, Shield, RefreshCw, IndianRupee, Building2,
  Settings, Bell, Search, LogOut, ChevronRight, TrendingUp, Target,
  FilePlus, Send, UserPlus, ArrowUpRight, Sparkles, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',     label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'leads',    label: 'Leads',     Icon: Users },
  { id: 'quotes',   label: 'Quotes',    Icon: FileText },
  { id: 'policies', label: 'Policies',  Icon: Shield },
  { id: 'renewals', label: 'Renewals',  Icon: RefreshCw },
  { id: 'earnings', label: 'Earnings',  Icon: IndianRupee },
  { id: 'team',     label: 'Team',      Icon: Building2 },
];

const STAT_CARDS = [
  { label: 'Active Leads',     value: '0',  change: '+0 this week',   Icon: Target,      iconColor: 'text-blue-600',    iconBg: 'bg-blue-50',    border: 'border-blue-100',    numColor: 'text-blue-700' },
  { label: 'Quotes Sent',      value: '0',  change: '+0 this month',  Icon: FileText,    iconColor: 'text-violet-600',  iconBg: 'bg-violet-50',  border: 'border-violet-100',  numColor: 'text-violet-700' },
  { label: 'Pending Renewals', value: '0',  change: 'Due this month', Icon: RefreshCw,   iconColor: 'text-amber-600',   iconBg: 'bg-amber-50',   border: 'border-amber-100',   numColor: 'text-amber-700' },
  { label: 'Monthly Earnings', value: '₹0', change: 'vs last month',  Icon: IndianRupee, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', border: 'border-emerald-100', numColor: 'text-emerald-700' },
];

const QUICK_ACTIONS = [
  { label: 'Add Lead',     Icon: UserPlus, desc: 'New prospect',  color: 'text-blue-600',    bg: 'bg-blue-50   hover:bg-blue-100' },
  { label: 'Create Quote', Icon: FilePlus, desc: 'Quick quote',   color: 'text-violet-600',  bg: 'bg-violet-50 hover:bg-violet-100' },
  { label: 'Send Renewal', Icon: Send,     desc: 'Remind client', color: 'text-amber-600',   bg: 'bg-amber-50  hover:bg-amber-100' },
  { label: 'Add Policy',   Icon: Shield,   desc: 'Record sale',   color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100' },
];

const MODULES = [
  { Icon: Target,      name: 'Leads',    desc: 'Track prospects',    color: 'text-blue-500' },
  { Icon: FileText,    name: 'Quotes',   desc: 'Generate quotes',    color: 'text-violet-500' },
  { Icon: Shield,      name: 'Policies', desc: 'Manage policies',    color: 'text-indigo-500' },
  { Icon: RefreshCw,   name: 'Renewals', desc: 'Auto-reminders',     color: 'text-amber-500' },
  { Icon: IndianRupee, name: 'Earnings', desc: 'Commission tracker', color: 'text-emerald-500' },
  { Icon: Building2,   name: 'Team',     desc: 'Sub-agents',         color: 'text-slate-500' },
];

export default function DashboardPage() {
  const agent = useAuthStore((s) => s.agent);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    router.push('/welcome');
  }

  const initials = agent?.fullName
    ? agent.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15"/>
              <circle cx="12" cy="13" r="2.5" fill="white"/>
              <path d="M12 6 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-slate-800 font-bold text-sm leading-none">Agent App</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Insurance Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = id === activeNav;
          return (
            <button
              key={id}
              onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-4 space-y-0.5 border-t border-slate-100 pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all">
          <Settings className="w-4 h-4 text-slate-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 lg:px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <Menu className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, policies…"
                className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border-0"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="relative w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
              </button>
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  {initials}
                </motion.div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 leading-none">{agent?.fullName?.split(' ')[0] ?? 'Agent'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Insurance Agent</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-8">

          {/* Team section */}
          {activeNav === 'team' && <TeamPage />}

          {/* Home section */}
          {activeNav === 'home' && (<>
          {/* Welcome banner */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl shadow-blue-600/20"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
              <div className="absolute right-24 -bottom-10 w-36 h-36 bg-white/5 rounded-full" />
              <div className="absolute right-6 top-6 w-20 h-20 bg-white/5 rounded-full" />
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-blue-200 text-sm font-medium">{greeting}</span>
                </div>
                <h2 className="text-white text-2xl font-bold">{agent?.fullName ?? 'Agent'}</h2>
                <p className="text-blue-200 text-sm mt-1">Here&apos;s your business overview for today</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                Business Active
              </div>
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map(({ label, value, change, Icon, iconColor, iconBg, border, numColor }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.09)' }}
                className={`bg-white border ${border} rounded-2xl p-5 shadow-sm cursor-default`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-200" />
                </div>
                <p className={`text-2xl font-bold ${numColor}`}>{value}</p>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">{label}</p>
                <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  {change}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom section */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick actions */}
            <motion.div variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-slate-800 font-bold text-sm mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map(({ label, Icon, desc, color, bg }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center gap-2.5 p-4 ${bg} rounded-xl transition-colors border border-transparent hover:border-slate-100 group`}
                  >
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <Icon className={`w-[18px] h-[18px] ${color}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-700 text-xs font-semibold">{label}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Platform modules */}
            <motion.div variants={fadeUp} className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-800 font-bold text-sm">Platform Modules</h3>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                  Coming Soon
                </span>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MODULES.map(({ Icon, name, desc, color }) => (
                  <motion.div
                    key={name}
                    variants={fadeUp}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-colors cursor-default group"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 group-hover:shadow-md transition-shadow">
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-slate-700 text-xs font-semibold">{name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
          </>)}
        </main>
      </div>
    </div>
  );
}
