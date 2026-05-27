'use client';

import { LeadStatus, LEAD_STATUS_LABELS } from '../types/leads.types';

const STATUS_CONFIG: Record<LeadStatus, { bg: string; text: string; border: string; dot: string }> = {
  [LeadStatus.NEW]:            { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  [LeadStatus.CONTACTED]:      { bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500' },
  [LeadStatus.INTERESTED]:     { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  [LeadStatus.QUOTE_REQUIRED]: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  [LeadStatus.QUOTE_SHARED]:   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500' },
  [LeadStatus.FOLLOW_UP]:      { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500' },
  [LeadStatus.CONVERTED]:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  [LeadStatus.LOST]:           { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400' },
};

interface Props {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export default function LeadStatusBadge({ status, size = 'sm' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG[LeadStatus.NEW];
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border'
    : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`${base} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`${dotSize} rounded-full ${cfg.dot} shrink-0`} />
      {LEAD_STATUS_LABELS[status] ?? status}
    </span>
  );
}
