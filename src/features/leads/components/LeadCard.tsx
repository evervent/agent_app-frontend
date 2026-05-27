'use client';

import { Phone, Calendar, MapPin, Mail, TrendingUp, Clock } from 'lucide-react';
import { Lead, LeadPriority, LeadStatus, LEAD_PRODUCT_LABELS, LEAD_SOURCE_LABELS } from '../types/leads.types';
import LeadStatusBadge from './LeadStatusBadge';

const PRIORITY_CONFIG: Record<LeadPriority, { label: string; dot: string; text: string }> = {
  [LeadPriority.LOW]:    { label: 'Low',    dot: 'bg-slate-400',   text: 'text-slate-500' },
  [LeadPriority.MEDIUM]: { label: 'Medium', dot: 'bg-amber-400',   text: 'text-amber-600' },
  [LeadPriority.HIGH]:   { label: 'High',   dot: 'bg-rose-500',    text: 'text-rose-600'  },
};

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
];

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

interface Props {
  lead: Lead;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, selected, onSelect, onClick }: Props) {
  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const gradient = getGradient(lead.name);
  const priority = PRIORITY_CONFIG[lead.priority];

  const followupDate = lead.nextFollowupAt ? new Date(lead.nextFollowupAt) : null;
  const isOverdue = followupDate && followupDate < new Date();
  const followupLabel = followupDate
    ? followupDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : null;

  const isConverted = lead.status === LeadStatus.CONVERTED;
  const isLost = lead.status === LeadStatus.LOST;

  function handleCheckbox(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect(lead.id);
  }

  return (
    <div
      onClick={() => onClick(lead)}
      className={`
        group relative bg-white rounded-2xl border cursor-pointer
        transition-all duration-200
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5
        ${selected
          ? 'border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
          : isConverted
            ? 'border-emerald-200'
            : isLost
              ? 'border-slate-200 opacity-75'
              : 'border-slate-200'
        }
      `}
    >
      {/* Converted accent bar */}
      {isConverted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl" />
      )}

      {/* High priority indicator */}
      {lead.priority === LeadPriority.HIGH && !isConverted && !isLost && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 rounded-t-2xl" />
      )}

      <div className="p-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={handleCheckbox}
          className={`
            absolute top-3.5 right-3.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150
            ${selected
              ? 'bg-blue-600 border-blue-600 shadow-sm'
              : 'border-slate-200 bg-white hover:border-blue-400 group-hover:border-slate-300'
            }
          `}
        >
          {selected && (
            <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pr-7">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-800 truncate leading-snug">{lead.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="text-xs text-slate-400 font-medium">{lead.mobile}</span>
            </div>
          </div>
        </div>

        {/* Status + Priority */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <LeadStatusBadge status={lead.status} />
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-semibold ${priority.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {lead.productInterest && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-semibold">
              <TrendingUp className="w-2.5 h-2.5" />
              {LEAD_PRODUCT_LABELS[lead.productInterest]}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mt-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left meta */}
            <div className="flex items-center gap-2.5 min-w-0">
              {lead.city && (
                <span className="flex items-center gap-0.5 text-[11px] text-slate-400 min-w-0">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lead.city}</span>
                </span>
              )}
              {lead.email && (
                <span className="flex items-center gap-0.5 text-[11px] text-slate-400 min-w-0">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[90px]">{lead.email.split('@')[0]}</span>
                </span>
              )}
              {lead.source && !lead.city && !lead.email && (
                <span className="text-[11px] text-slate-400">{LEAD_SOURCE_LABELS[lead.source]}</span>
              )}
            </div>

            {/* Followup date */}
            {followupLabel && (
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold shrink-0 ${
                isOverdue ? 'text-rose-500' : 'text-amber-600'
              }`}>
                {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                {followupLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
