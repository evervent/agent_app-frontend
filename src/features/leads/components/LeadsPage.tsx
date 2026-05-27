'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, SlidersHorizontal, X, RefreshCw, Users, TrendingUp, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectInputField, Button } from 'ev-ui-lab';
import {
  Lead,
  LeadStatus,
  LeadPriority,
  LeadProductInterest,
  LEAD_STATUS_LABELS,
  LEAD_PRODUCT_LABELS,
  LEAD_PRIORITY_LABELS,
} from '../types/leads.types';
import { useLeads } from '../hooks/useLeads';
import { useAuthStore } from '@/shared/store/authStore';
import { workspaceMembersService } from '../services/workspaceMembers.service';
import type { WorkspaceMemberItem } from '../services/workspaceMembers.service';
import LeadCard from './LeadCard';
import CreateLeadDrawer from './CreateLeadDrawer';
import LeadDetailDrawer from './LeadDetailDrawer';

const BULK_STATUS_ITEMS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ label, value }));

// Custom dropdown — always opens downward, never overlaps content above
interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
}
function FilterSelect({ value, onChange, placeholder, options }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`h-10 pl-3 pr-8 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center whitespace-nowrap relative ${
          value ? 'border-blue-400 text-blue-700 bg-blue-50 font-medium' : 'border-slate-200 text-slate-500 bg-slate-50 hover:border-slate-300'
        }`}
      >
        {selected ? selected.label : placeholder}
        <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-xl z-[100] py-1 overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${!value ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {placeholder}
          </button>
          <div className="border-t border-slate-100 my-0.5" />
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === o.value ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, icon, color, bg, onClick, active }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-3 bg-white rounded-2xl border px-4 py-3.5 text-left w-full transition-all duration-200
        ${active
          ? `border-current ${color} shadow-sm ring-1 ring-current/20`
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }
      `}
    >
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </button>
  );
}

export default function LeadsPage() {
  const hook = useLeads({ limit: 20 });
  const {
    leads, total, totalPages, page, loading, error,
    selectedIds, allSelected,
    filters, applyFilters, goToPage, refetch,
    createLead, updateLead, removeLead, bulkUpdateStatus,
    toggleSelect, toggleSelectAll, clearSelection,
  } = hook;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const currentAgent = useAuthStore((s) => s.agent);
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [assignedToFilter, setAssignedToFilter] = useState('');

  useEffect(() => {
    workspaceMembersService.list().then((res) => setMembers(res.data)).catch(() => {});
  }, []);

  const ownerFilterItems = useMemo(() => {
    const items: { label: string; value: string }[] = [{ label: 'All Owners', value: '' }];
    if (currentAgent) items.push({ label: `${currentAgent.fullName} (You)`, value: currentAgent.id });
    members.forEach((m) => {
      if (m.agentId !== currentAgent?.id) items.push({ label: m.agent.fullName, value: m.agentId });
    });
    return items;
  }, [members, currentAgent]);

  // Quick stat counts from current loaded leads (visible page)
  const stats = useMemo(() => ({
    total,
    active: leads.filter((l) => ![LeadStatus.CONVERTED, LeadStatus.LOST].includes(l.status)).length,
    converted: leads.filter((l) => l.status === LeadStatus.CONVERTED).length,
    high: leads.filter((l) => l.priority === LeadPriority.HIGH).length,
  }), [leads, total]);

  function applyAll() {
    applyFilters({
      search: search || undefined,
      status: (statusFilter as LeadStatus) || undefined,
      productInterest: (productFilter as LeadProductInterest) || undefined,
      priority: (priorityFilter as LeadPriority) || undefined,
      assignedToId: assignedToFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setProductFilter('');
    setPriorityFilter('');
    setAssignedToFilter('');
    setDateFrom('');
    setDateTo('');
    applyFilters({});
  }

  function handleCardClick(lead: Lead) {
    setDetailLead(lead);
    setDetailOpen(true);
  }

  function handleEdit(lead: Lead) {
    setDetailOpen(false);
    setEditLead(lead);
  }

  async function handleBulkApply() {
    if (!bulkStatus || selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await bulkUpdateStatus({ ids: selectedIds, status: bulkStatus as LeadStatus });
      setBulkStatus('');
    } finally {
      setBulkLoading(false);
    }
  }

  const hasActiveFilters = !!(search || statusFilter || productFilter || priorityFilter || assignedToFilter || dateFrom || dateTo);

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Leads</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? 'Loading…' : `${total} lead${total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            title="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Leads"
            value={total}
            icon={<Users className="w-4 h-4" />}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={<SlidersHorizontal className="w-4 h-4" />}
            color="text-violet-600"
            bg="bg-violet-50"
          />
          <StatCard
            label="Converted"
            value={stats.converted}
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="text-emerald-600"
            bg="bg-emerald-50"
            onClick={() => { setStatusFilter(LeadStatus.CONVERTED); }}
          />
          <StatCard
            label="High Priority"
            value={stats.high}
            icon={<AlertCircle className="w-4 h-4" />}
            color="text-rose-600"
            bg="bg-rose-50"
            onClick={() => { setPriorityFilter(LeadPriority.HIGH); }}
          />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        {/* Row 1: search + filter dropdowns — all h-10, same line */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name or mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyAll()}
              className="w-full h-10 pl-9 pr-3 text-sm text-slate-700 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>

          {/* Status */}
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
            options={Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l as string }))}
          />

          {/* Product */}
          <FilterSelect
            value={productFilter}
            onChange={setProductFilter}
            placeholder="Product"
            options={Object.entries(LEAD_PRODUCT_LABELS).map(([v, l]) => ({ value: v, label: l as string }))}
          />

          {/* Priority */}
          <FilterSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            placeholder="Priority"
            options={Object.entries(LEAD_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l as string }))}
          />

          {/* Owner */}
          <FilterSelect
            value={assignedToFilter}
            onChange={setAssignedToFilter}
            placeholder="Owner"
            options={ownerFilterItems.filter((i) => i.value)}
          />
        </div>

        {/* Row 2: date range + apply + clear */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl bg-slate-50 px-3 h-10">
            <span className="text-xs text-slate-400 font-medium shrink-0">From</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm text-slate-600 bg-transparent focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl bg-slate-50 px-3 h-10">
            <span className="text-xs text-slate-400 font-medium shrink-0">To</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm text-slate-600 bg-transparent focus:outline-none" />
          </div>
          <button onClick={applyAll} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Apply
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="h-10 px-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all font-medium">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3"
          >
            <button
              type="button"
              onClick={clearSelection}
              className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
            <span className="text-sm font-semibold text-blue-800">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <div className="min-w-[160px]">
                <SelectInputField
                  title="Change Status"
                  attrName="bulkStatus"
                  value={bulkStatus}
                  value_update={(_, v) => setBulkStatus(v)}
                  options={[{ label: 'Select new status…', value: '' }, ...BULK_STATUS_ITEMS]}
                  disabled={bulkLoading}
                />
              </div>
              <Button
                text={bulkLoading ? 'Updating…' : 'Apply'}
                className="primaryBtn"
                size="small"
                onClick={handleBulkApply}
                disabled={!bulkStatus || bulkLoading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Select all row ── */}
      {leads.length > 0 && (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleSelectAll}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              allSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white hover:border-blue-400'
            }`}
          >
            {allSelected && (
              <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-xs text-slate-400 font-medium select-none">
            {allSelected ? `Deselect all ${leads.length}` : `Select all ${leads.length}`}
          </span>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Lead grid / empty / skeleton ── */}
      {loading && leads.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-slate-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-5 bg-slate-100 rounded-full w-20" />
                <div className="h-5 bg-slate-100 rounded-full w-14" />
                <div className="h-5 bg-slate-100 rounded-full w-16" />
              </div>
              <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
            {hasActiveFilters
              ? <SlidersHorizontal className="w-9 h-9 text-blue-400" />
              : <TrendingUp className="w-9 h-9 text-blue-500" />
            }
          </div>
          <p className="text-slate-700 font-bold text-lg">
            {hasActiveFilters ? 'No matching leads' : 'No leads yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            {hasActiveFilters
              ? 'No leads match your current filters. Try adjusting or clearing them.'
              : 'Start adding leads to track your pipeline and close more deals.'}
          </p>
          <div className="flex items-center gap-3 mt-5">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 font-semibold border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {leads.map((lead) => (
            <motion.div
              key={lead.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
            >
              <LeadCard
                lead={lead}
                selected={selectedIds.includes(lead.id)}
                onSelect={toggleSelect}
                onClick={handleCardClick}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={loading}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Drawers ── */}
      <CreateLeadDrawer
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onCreate={createLead}
        onUpdate={updateLead}
      />
      <CreateLeadDrawer
        open={!!editLead}
        mode="edit"
        lead={editLead}
        onClose={() => setEditLead(null)}
        onCreate={createLead}
        onUpdate={updateLead}
      />
      <LeadDetailDrawer
        open={detailOpen}
        lead={detailLead}
        onClose={() => setDetailOpen(false)}
        onEdit={(lead) => { setDetailOpen(false); handleEdit(lead); }}
        onUpdate={updateLead}
        onDelete={removeLead}
      />
    </div>
  );
}


// const STATUS_FILTER_ITEMS = makeItems(LEAD_STATUS_LABELS, 'All Statuses');
// const PRODUCT_FILTER_ITEMS = makeItems(LEAD_PRODUCT_LABELS, 'All Products');
// const PRIORITY_FILTER_ITEMS = makeItems(LEAD_PRIORITY_LABELS, 'All Priorities');
// const BULK_STATUS_ITEMS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ label, value }));

// export default function LeadsPage() {
//   const hook = useLeads({ limit: 20 });
//   const {
//     leads, total, totalPages, page, loading, error,
//     selectedIds, allSelected,
//     filters, applyFilters, goToPage, refetch,
//     createLead, updateLead, removeLead, bulkUpdateStatus,
//     toggleSelect, toggleSelectAll, clearSelection,
//   } = hook;

//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [productFilter, setProductFilter] = useState('');
//   const [priorityFilter, setPriorityFilter] = useState('');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');

//   const [createOpen, setCreateOpen] = useState(false);
//   const [editLead, setEditLead] = useState<Lead | null>(null);
//   const [detailLead, setDetailLead] = useState<Lead | null>(null);
//   const [detailOpen, setDetailOpen] = useState(false);

//   const [bulkStatus, setBulkStatus] = useState('');
//   const [bulkLoading, setBulkLoading] = useState(false);

//   const currentAgent = useAuthStore((s) => s.agent);
//   const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
//   const [assignedToFilter, setAssignedToFilter] = useState('');

//   useEffect(() => {
//     workspaceMembersService.list().then((res) => setMembers(res.data)).catch(() => {});
//   }, []);

//   const ownerFilterItems = useMemo(() => {
//     const items: { label: string; value: string }[] = [{ label: 'All Owners', value: '' }];
//     if (currentAgent) {
//       items.push({ label: `${currentAgent.fullName} (You)`, value: currentAgent.id });
//     }
//     members.forEach((m) => {
//       if (m.agentId !== currentAgent?.id) {
//         items.push({ label: m.agent.fullName, value: m.agentId });
//       }
//     });
//     return items;
//   }, [members, currentAgent]);

//   function applyAll() {
//     applyFilters({
//       search: search || undefined,
//       status: (statusFilter as LeadStatus) || undefined,
//       productInterest: (productFilter as LeadProductInterest) || undefined,
//       priority: (priorityFilter as LeadPriority) || undefined,
//       assignedToId: assignedToFilter || undefined,
//       dateFrom: dateFrom || undefined,
//       dateTo: dateTo || undefined,
//     });
//   }

//   function clearFilters() {
//     setSearch('');
//     setStatusFilter('');
//     setProductFilter('');
//     setPriorityFilter('');
//     setAssignedToFilter('');
//     setDateFrom('');
//     setDateTo('');
//     applyFilters({});
//   }

//   function handleCardClick(lead: Lead) {
//     setDetailLead(lead);
//     setDetailOpen(true);
//   }

//   function handleEdit(lead: Lead) {
//     setDetailOpen(false);
//     setEditLead(lead);
//   }

//   async function handleBulkApply() {
//     if (!bulkStatus || selectedIds.length === 0) return;
//     setBulkLoading(true);
//     try {
//       await bulkUpdateStatus({ ids: selectedIds, status: bulkStatus as LeadStatus });
//       setBulkStatus('');
//     } finally {
//       setBulkLoading(false);
//     }
//   }

//   const hasActiveFilters = !!(search || statusFilter || productFilter || priorityFilter || assignedToFilter || dateFrom || dateTo);

//   return (
//     <div className="space-y-5">
//       {/* Page header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Leads</h1>
//           <p className="text-sm text-slate-400 mt-0.5">
//             {loading ? 'Loading…' : `${total} lead${total !== 1 ? 's' : ''}`}
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={refetch}
//             className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//           <button
//             onClick={() => setCreateOpen(true)}
//             className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
//           >
//             <Plus className="w-4 h-4" />
//             Add Lead
//           </button>
//         </div>
//       </div>

//       {/* Filter bar */}
//       <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
//         <div className="flex items-center gap-2 flex-wrap">
//           <div className="flex-1 min-w-[160px]">
//             <TextInputField
//               title=""
//               attrName="search"
//               placeholder="Search by name or mobile…"
//               value={search}
//               value_update={(_, v) => setSearch(v)}
//             />
//           </div>
//           <div className="min-w-[140px]">
//             <SelectInputField
//               title=""
//               attrName="status"
//               value={statusFilter}
//               value_update={(_, v) => setStatusFilter(v)}
//               options={STATUS_FILTER_ITEMS}
//             />
//           </div>
//           <div className="min-w-[140px]">
//             <SelectInputField
//               title=""
//               attrName="product"
//               value={productFilter}
//               value_update={(_, v) => setProductFilter(v)}
//               options={PRODUCT_FILTER_ITEMS}
//             />
//           </div>
//           <div className="min-w-[130px]">
//             <SelectInputField
//               title=""
//               attrName="priority"
//               value={priorityFilter}
//               value_update={(_, v) => setPriorityFilter(v)}
//               options={PRIORITY_FILTER_ITEMS}
//             />
//           </div>
//           <div className="min-w-[140px]">
//             <SelectInputField
//               title=""
//               attrName="assignedTo"
//               value={assignedToFilter}
//               value_update={(_, v) => setAssignedToFilter(v)}
//               options={ownerFilterItems}
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           <input
//             type="date"
//             value={dateFrom}
//             onChange={(e) => setDateFrom(e.target.value)}
//             className="text-sm text-slate-600 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="From date"
//           />
//           <input
//             type="date"
//             value={dateTo}
//             onChange={(e) => setDateTo(e.target.value)}
//             className="text-sm text-slate-600 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="To date"
//           />
//           <Button text="Apply Filters" className="primaryBtn" size="small" onClick={applyAll} />
//           {hasActiveFilters && (
//             <button
//               onClick={clearFilters}
//               className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
//             >
//               <X className="w-3.5 h-3.5" />
//               Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Bulk action bar */}
//       <AnimatePresence>
//         {selectedIds.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3"
//           >
//             <div className="flex items-center gap-2">
//               <button
//                 type="button"
//                 onClick={clearSelection}
//                 className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center"
//               >
//                 <X className="w-3 h-3 text-white" />
//               </button>
//               <span className="text-sm font-semibold text-blue-800">
//                 {selectedIds.length} selected
//               </span>
//             </div>
//             <div className="flex items-center gap-2 ml-auto">
//               <div className="min-w-[150px]">
//                 <SelectInputField
//                   title=""
//                   attrName="bulkStatus"
//                   value={bulkStatus}
//                   value_update={(_, v) => setBulkStatus(v)}
//                   options={[{ label: 'Change status to…', value: '' }, ...BULK_STATUS_ITEMS]}
//                   disabled={bulkLoading}
//                 />
//               </div>
//               <Button
//                 text={bulkLoading ? 'Updating…' : 'Apply'}
//                 className="primaryBtn"
//                 size="small"
//                 onClick={handleBulkApply}
//                 disabled={!bulkStatus || bulkLoading}
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Select all bar */}
//       {leads.length > 0 && (
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={toggleSelectAll}
//             className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
//               allSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white hover:border-blue-400'
//             }`}
//           >
//             {allSelected && (
//               <svg viewBox="0 0 10 8" fill="none" className="w-3 h-3">
//                 <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             )}
//           </button>
//           <span className="text-xs text-slate-400 font-medium">
//             {allSelected ? 'Deselect all' : `Select all ${leads.length}`}
//           </span>
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
//           {error}
//         </div>
//       )}

//       {/* Lead grid */}
//       {loading && leads.length === 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
//               <div className="flex gap-3">
//                 <div className="w-9 h-9 bg-slate-200 rounded-xl" />
//                 <div className="flex-1 space-y-2">
//                   <div className="h-3.5 bg-slate-200 rounded w-3/4" />
//                   <div className="h-3 bg-slate-100 rounded w-1/2" />
//                 </div>
//               </div>
//               <div className="flex gap-2 mt-3">
//                 <div className="h-5 bg-slate-100 rounded-full w-20" />
//                 <div className="h-5 bg-slate-100 rounded-full w-14" />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : leads.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 text-center">
//           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
//             <SlidersHorizontal className="w-7 h-7 text-blue-500" />
//           </div>
//           <p className="text-slate-700 font-semibold text-base">No leads yet</p>
//           <p className="text-sm text-slate-400 mt-1 max-w-xs">
//             {hasActiveFilters ? 'No leads match your filters. Try clearing some.' : 'Add your first lead to get started.'}
//           </p>
//           {hasActiveFilters ? (
//             <button
//               onClick={clearFilters}
//               className="mt-4 text-sm text-blue-600 font-semibold hover:underline"
//             >
//               Clear filters
//             </button>
//           ) : (
//             <button
//               onClick={() => setCreateOpen(true)}
//               className="mt-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
//             >
//               <Plus className="w-4 h-4" />
//               Add Lead
//             </button>
//           )}
//         </div>
//       ) : (
//         <motion.div
//           initial="hidden"
//           animate="show"
//           variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
//           className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
//         >
//           {leads.map((lead) => (
//             <motion.div
//               key={lead.id}
//               variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
//             >
//               <LeadCard
//                 lead={lead}
//                 selected={selectedIds.includes(lead.id)}
//                 onSelect={toggleSelect}
//                 onClick={handleCardClick}
//               />
//             </motion.div>
//           ))}
//         </motion.div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-center gap-2 pt-2">
//           <button
//             onClick={() => goToPage(page - 1)}
//             disabled={page <= 1 || loading}
//             className="px-3 py-1.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//           >
//             ← Prev
//           </button>
//           <span className="text-sm text-slate-500 px-2">
//             Page {page} of {totalPages}
//           </span>
//           <button
//             onClick={() => goToPage(page + 1)}
//             disabled={page >= totalPages || loading}
//             className="px-3 py-1.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//           >
//             Next →
//           </button>
//         </div>
//       )}

//       {/* Create Lead Drawer */}
//       <CreateLeadDrawer
//         open={createOpen}
//         mode="create"
//         onClose={() => setCreateOpen(false)}
//         onCreate={createLead}
//         onUpdate={updateLead}
//       />

//       {/* Edit Lead Drawer */}
//       <CreateLeadDrawer
//         open={!!editLead}
//         mode="edit"
//         lead={editLead}
//         onClose={() => setEditLead(null)}
//         onCreate={createLead}
//         onUpdate={updateLead}
//       />

//       {/* Detail Drawer */}
//       <LeadDetailDrawer
//         open={detailOpen}
//         lead={detailLead}
//         onClose={() => setDetailOpen(false)}
//         onEdit={(lead) => { setDetailOpen(false); handleEdit(lead); }}
//         onUpdate={updateLead}
//         onDelete={removeLead}
//       />
//     </div>
//   );
// }
