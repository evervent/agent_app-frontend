'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Copy, Trash2, Pencil, Lock, ArrowLeft, ShieldCheck,
  Users, Sparkles, ChevronRight, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listRoles, deleteRole, duplicateRole } from '../services/roles.service';
import { RoleListItem } from '../types/roles.types';

// Colour palette per system role name
const SYSTEM_ROLE_COLORS: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  owner:            { bg: 'bg-violet-50',  border: 'border-violet-100', icon: 'text-violet-500',  badge: 'bg-violet-100 text-violet-700' },
  sub_agent:        { bg: 'bg-blue-50',    border: 'border-blue-100',   icon: 'text-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  telecaller:       { bg: 'bg-amber-50',   border: 'border-amber-100',  icon: 'text-amber-500',   badge: 'bg-amber-100 text-amber-700' },
  operations_user:  { bg: 'bg-emerald-50', border: 'border-emerald-100',icon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  viewer:           { bg: 'bg-slate-50',   border: 'border-slate-200',  icon: 'text-slate-400',   badge: 'bg-slate-100 text-slate-600' },
};

function formatRoleName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  onBack?: () => void;
}

export default function RolesPage({ onBack }: Props) {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listRoles();
      setRoles(data);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDuplicate(role: RoleListItem) {
    const newName = window.prompt(`Duplicate "${formatRoleName(role.name)}" as:`, `${formatRoleName(role.name)} (Copy)`);
    if (!newName?.trim()) return;
    try {
      setDuplicatingId(role.id);
      await duplicateRole(role.id, newName.trim());
      toast.success('Role duplicated');
      await load();
    } catch {
      toast.error('Failed to duplicate role');
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(role: RoleListItem) {
    if (!window.confirm(`Delete "${role.name}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(role.id);
      await deleteRole(role.id);
      toast.success('Role deleted');
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeletingId(null);
    }
  }

  const systemRoles = roles.filter((r) => r.roleType === 'system');
  const customRoles  = roles.filter((r) => r.roleType === 'custom');

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm text-slate-400">Loading roles…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
              title="Back to dashboard"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Roles &amp; Permissions</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Control what each team member can see and do
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard/roles/create')}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all shrink-0"
        >
          <Plus size={15} />
          New Role
        </motion.button>
      </div>

      {/* ── System Roles ────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={13} className="text-slate-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            System Roles
          </h2>
          <span className="ml-auto text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {systemRoles.length} roles
          </span>
        </div>
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {systemRoles.map((role) => {
            const colors = SYSTEM_ROLE_COLORS[role.name] ?? SYSTEM_ROLE_COLORS['viewer'];
            return (
              <motion.div
                key={role.id}
                variants={fadeUp}
                className={`relative group flex items-center justify-between rounded-2xl border ${colors.border} ${colors.bg} px-4 py-3.5 transition-all hover:shadow-sm`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl bg-white border ${colors.border} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Lock size={13} className={colors.icon} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {formatRoleName(role.name)}
                      </p>
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.badge}`}>
                        System
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{role.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDuplicate(role)}
                  disabled={duplicatingId === role.id}
                  title="Duplicate as custom role"
                  className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-30 shadow-sm"
                >
                  {duplicatingId === role.id
                    ? <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                    : <Copy size={12} />
                  }
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Custom Roles ────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={13} className="text-indigo-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Custom Roles
          </h2>
          {customRoles.length > 0 && (
            <span className="ml-auto text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              {customRoles.length} role{customRoles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {customRoles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center"
            >
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={22} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No custom roles yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Create custom roles to give team members exactly the access they need.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/dashboard/roles/create')}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all"
              >
                <Plus size={14} />
                Create Custom Role
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-2.5"
            >
              {customRoles.map((role) => (
                <motion.div
                  key={role.id}
                  variants={fadeUp}
                  layout
                  className={`group flex items-center justify-between rounded-2xl border bg-white px-4 py-3.5 hover:shadow-md hover:border-indigo-100 transition-all cursor-default
                    ${role.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}
                    ${deletingId === role.id ? 'opacity-40 pointer-events-none' : ''}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <ShieldCheck size={14} className="text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 truncate">{role.name}</p>
                        {!role.isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-md">
                            <AlertCircle size={9} />
                            Inactive
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{role.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
                      title="Edit role"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(role)}
                      disabled={duplicatingId === role.id}
                      title="Duplicate role"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all disabled:opacity-30"
                    >
                      {duplicatingId === role.id
                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" />
                        : <Copy size={13} />
                      }
                    </button>
                    <button
                      onClick={() => handleDelete(role)}
                      title="Delete role"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={13} className="text-slate-200 ml-1 group-hover:text-slate-300 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
