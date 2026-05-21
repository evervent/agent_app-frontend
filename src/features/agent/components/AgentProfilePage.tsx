'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@mui/material';
import { TextInputField, SelectInputField, Button } from 'ev-ui-lab';
import {
  CheckCircle2, Circle, Pencil, X, Phone, Mail, MapPin, Briefcase,
  CreditCard, Building2, ShieldCheck, FileText, Users, Layers, CheckCheck,
} from 'lucide-react';
import { useAgentProfile } from '../hooks/useAgentProfile';
import { agentService } from '../services/agent.service';
import { useAuthStore } from '@/shared/store/authStore';

// ─── helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function mask(value: string | null | undefined, show = 4): string {
  if (!value) return '—';
  return '••••' + value.slice(-show);
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
].map((s) => ({ value: s, label: s }));

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year' },
  ...Array.from({ length: 28 }, (_, i) => ({ value: String(i + 2), label: `${i + 2} years` })),
  { value: '30', label: '30+ years' },
];

// ─── Completion Ring ─────────────────────────────────────────────────────────

function CompletionRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = circ - (circ * Math.min(pct, 100)) / 100;
  const color = pct < 40 ? '#ef4444' : pct < 75 ? '#f59e0b' : '#22c55e';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88" width={96} height={96}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="relative text-center">
        <p className="text-xl font-bold text-slate-800 leading-none">{pct}<span className="text-xs font-semibold text-slate-400">%</span></p>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">complete</p>
      </div>
    </div>
  );
}

// ─── Section progress helpers ──────────────────────────────────────────────

interface Field { label: string; value: unknown }

function sectionPct(fields: Field[]): number {
  const filled = fields.filter((f) => {
    if (Array.isArray(f.value)) return f.value.length > 0;
    return f.value !== null && f.value !== undefined && f.value !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}

function FieldRow({ field }: { field: Field }) {
  const filled = Array.isArray(field.value) ? field.value.length > 0 : (field.value !== null && field.value !== undefined && field.value !== '');
  return (
    <div className="flex items-center gap-2 text-xs">
      {filled
        ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
        : <Circle size={13} className="text-slate-300 shrink-0" />}
      <span className={filled ? 'text-slate-600' : 'text-slate-400'}>{field.label}</span>
      {!filled && <span className="ml-auto text-amber-500 font-medium">Incomplete</span>}
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  Icon: React.ElementType;
  fields: Field[];
  pct: number;
  onEdit: () => void;
}

function SectionCard({ title, Icon, fields, pct, onEdit }: SectionCardProps) {
  const color = pct < 40 ? 'text-red-500' : pct < 100 ? 'text-amber-500' : 'text-emerald-500';
  const bg    = pct < 40 ? 'bg-red-50 border-red-100' : pct < 100 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
            <Icon className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-700">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${color}`}>{pct}%</span>
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Pencil size={13} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="h-1 bg-slate-100 rounded-full mb-4">
        <div
          className={`h-1 rounded-full transition-all duration-700 ${pct < 40 ? 'bg-red-400' : pct < 100 ? 'bg-amber-400' : 'bg-emerald-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {fields.map((f) => <FieldRow key={f.label} field={f} />)}
      </div>

      {pct < 100 && (
        <button
          onClick={onEdit}
          className={`mt-4 w-full py-2 text-xs font-semibold rounded-xl border ${bg} ${color} transition-all hover:opacity-80`}
        >
          Complete this section →
        </button>
      )}
    </div>
  );
}

// ─── Edit modals ───────────────────────────────────────────────────────────

interface EditBasicProps { onClose: () => void; onSaved: () => void; initialData: Record<string, string>; }

function EditBasicDrawer({ onClose, onSaved, initialData }: EditBasicProps) {
  const [form, setForm] = useState({
    irdaLicenseNumber: initialData.irdaLicenseNumber ?? '',
    agencyName: initialData.agencyName ?? '',
    state: initialData.state ?? '',
    city: initialData.city ?? '',
    experienceYears: initialData.experienceYears ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(attr: string, val: string) { setForm((p) => ({ ...p, [attr]: val })); }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await agentService.updateProfile({
        irdaLicenseNumber: form.irdaLicenseNumber || undefined,
        agencyName: form.agencyName || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
      });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditSheet title="Basic Info" onClose={onClose}>
      <TextInputField title="IRDA License Number" value={form.irdaLicenseNumber} attrName="irdaLicenseNumber" value_update={update} validation_type="ALPHANUMERIC" placeholder="e.g. IRL-0000000" />
      <TextInputField title="Agency / Firm Name" value={form.agencyName} attrName="agencyName" value_update={update} validation_type="NAME" placeholder="e.g. Sharma Insurance" />
      <SelectInputField title="State" value={form.state} attrName="state" value_update={update} options={STATES} placeholder="Select state" />
      <TextInputField title="City" value={form.city} attrName="city" value_update={update} validation_type="NAME" placeholder="e.g. Mumbai" />
      <SelectInputField title="Experience" value={form.experienceYears} attrName="experienceYears" value_update={update} options={EXPERIENCE_OPTIONS} placeholder="Years of experience" />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button text="Cancel" className="outlinedBtn" size="medium" onClick={onClose} disabled={saving} />
        <Button text="Save Changes" className="primaryBtn" size="medium" onClick={save} loader={saving} disabled={saving} />
      </div>
    </EditSheet>
  );
}

interface EditFinancialProps { onClose: () => void; onSaved: () => void; initialData: Record<string, string>; }

function EditFinancialDrawer({ onClose, onSaved, initialData }: EditFinancialProps) {
  const [form, setForm] = useState({
    panNumber: initialData.panNumber ?? '',
    bankAccountNumber: initialData.bankAccountNumber ?? '',
    ifscCode: initialData.ifscCode ?? '',
    gstNumber: initialData.gstNumber ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(attr: string, val: string) { setForm((p) => ({ ...p, [attr]: val })); }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await agentService.updateBusinessDetails({
        panNumber: form.panNumber || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined,
        ifscCode: form.ifscCode || undefined,
        gstNumber: form.gstNumber || undefined,
      });
      onSaved();
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditSheet title="Financial Details" onClose={onClose}>
      <TextInputField title="PAN Number" value={form.panNumber} attrName="panNumber" value_update={update} validation_type="ALL_CAPS" placeholder="e.g. ABCDE1234F" max_length={10} />
      <TextInputField title="Bank Account Number" value={form.bankAccountNumber} attrName="bankAccountNumber" value_update={update} validation_type="NUMBER" placeholder="Account number" />
      <TextInputField title="IFSC Code" value={form.ifscCode} attrName="ifscCode" value_update={update} validation_type="ALPHANUMERIC" placeholder="e.g. SBIN0001234" max_length={11} />
      <TextInputField title="GST Number" value={form.gstNumber} attrName="gstNumber" value_update={update} validation_type="ALPHANUMERIC" placeholder="e.g. 27ABCDE1234F1Z5" max_length={15} />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button text="Cancel" className="outlinedBtn" size="medium" onClick={onClose} disabled={saving} />
        <Button text="Save Changes" className="primaryBtn" size="medium" onClick={save} loader={saving} disabled={saving} />
      </div>
    </EditSheet>
  );
}

// ─── Generic slide-over sheet ─────────────────────────────────────────────

function EditSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Edit {title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {children}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

type EditMode = 'basic' | 'financial' | null;

export default function AgentProfilePage() {
  const agent = useAuthStore((s) => s.agent);
  const { profile, workspace, completion, loading, refetch } = useAgentProfile();
  const [editMode, setEditMode] = useState<EditMode>(null);

  const initials = agent?.fullName ? getInitials(agent.fullName) : 'A';

  // section fields for completion tracking
  const basicFields: Field[] = [
    { label: 'IRDA License Number', value: profile?.irdaLicenseNumber },
    { label: 'Agency / Firm Name',  value: profile?.agencyName },
    { label: 'State',               value: profile?.state },
    { label: 'City',                value: profile?.city },
    { label: 'Experience',          value: profile?.experienceYears },
  ];

  const financialFields: Field[] = [
    { label: 'PAN Number',       value: profile?.panNumber },
    { label: 'Bank Account',     value: profile?.bankAccountNumber },
    { label: 'IFSC Code',        value: profile?.ifscCode },
    { label: 'GST Number',       value: profile?.gstNumber },
  ];

  const workspaceFields: Field[] = [
    { label: 'Business Name',     value: workspace?.businessName },
    { label: 'Location',          value: workspace?.city },
    { label: 'Product Interests', value: workspace?.productInterests },
    { label: 'Team Type',         value: workspace?.teamType },
  ];

  const basicPct     = sectionPct(basicFields);
  const financialPct = sectionPct(financialFields);
  const workspacePct = sectionPct(workspaceFields);

  const overallPct = profile?.profileCompletionPercentage ?? completion;

  function handleSaved() { refetch?.(); }

  if (loading) {
    return (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="h-40 bg-white rounded-2xl border border-slate-100" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-56 bg-white rounded-2xl border border-slate-100" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {editMode === 'basic' && (
          <EditBasicDrawer
            onClose={() => setEditMode(null)}
            onSaved={handleSaved}
            initialData={{
              irdaLicenseNumber: profile?.irdaLicenseNumber ?? '',
              agencyName:        profile?.agencyName ?? '',
              state:             profile?.state ?? '',
              city:              profile?.city ?? '',
              experienceYears:   String(profile?.experienceYears ?? ''),
            }}
          />
        )}
        {editMode === 'financial' && (
          <EditFinancialDrawer
            onClose={() => setEditMode(null)}
            onSaved={handleSaved}
            initialData={{
              panNumber:          profile?.panNumber ?? '',
              bankAccountNumber:  profile?.bankAccountNumber ?? '',
              ifscCode:           profile?.ifscCode ?? '',
              gstNumber:          profile?.gstNumber ?? '',
            }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">

        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar
                sx={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  fontWeight: 700, fontSize: '1.4rem',
                }}
              >
                {initials}
              </Avatar>
              {overallPct === 100 && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckCheck size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Name + contact */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">{agent?.fullName ?? '—'}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{profile?.agencyName ?? 'No agency set'}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone size={12} className="text-slate-400" />{agent?.mobile ?? '—'}
                </span>
                {agent?.email && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail size={12} className="text-slate-400" />{agent.email}
                  </span>
                )}
                {profile?.city && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-400" />{profile.city}, {profile.state}
                  </span>
                )}
                {profile?.experienceYears != null && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Briefcase size={12} className="text-slate-400" />{profile.experienceYears}y experience
                  </span>
                )}
              </div>
            </div>

            {/* Completion ring */}
            <div className="shrink-0">
              <CompletionRing pct={overallPct} />
              <p className="text-center text-[10px] text-slate-400 font-medium mt-1">Profile Health</p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500">Overall Completion</p>
              <p className={`text-xs font-bold ${overallPct < 40 ? 'text-red-500' : overallPct < 75 ? 'text-amber-500' : overallPct < 100 ? 'text-blue-500' : 'text-emerald-500'}`}>
                {overallPct < 40 ? 'Needs attention' : overallPct < 75 ? 'Good progress' : overallPct < 100 ? 'Almost there!' : '🎉 All done!'}
              </p>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`h-2 rounded-full ${overallPct < 40 ? 'bg-red-400' : overallPct < 75 ? 'bg-amber-400' : overallPct < 100 ? 'bg-blue-500' : 'bg-emerald-400'}`}
              />
            </div>

            {/* Quick field pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: 'IRDA',    filled: !!profile?.irdaLicenseNumber },
                { label: 'Agency',  filled: !!profile?.agencyName },
                { label: 'PAN',     filled: !!profile?.panNumber },
                { label: 'Bank',    filled: !!profile?.bankAccountNumber },
                { label: 'IFSC',    filled: !!profile?.ifscCode },
                { label: 'GST',     filled: !!profile?.gstNumber },
                { label: 'Workspace', filled: !!workspace?.businessName },
              ].map(({ label, filled }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${filled ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                >
                  {filled ? <CheckCircle2 size={9} /> : <Circle size={9} />}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } } }}>
            <SectionCard
              title="Basic Info"
              Icon={ShieldCheck}
              fields={basicFields}
              pct={basicPct}
              onEdit={() => setEditMode('basic')}
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } } }}>
            <SectionCard
              title="Financial Details"
              Icon={CreditCard}
              fields={financialFields}
              pct={financialPct}
              onEdit={() => setEditMode('financial')}
            />
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } } }}>
            <SectionCard
              title="Workspace"
              Icon={Building2}
              fields={workspaceFields}
              pct={workspacePct}
              onEdit={() => {}}  // workspace editing via onboarding flow
            />
          </motion.div>
        </motion.div>

        {/* IRDA License detail card — only when filled */}
        {profile?.irdaLicenseNumber && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">IRDA License</p>
                <p className="text-blue-900 font-bold text-base font-mono mt-0.5">{profile.irdaLicenseNumber}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} /> Verified
              </div>
            </div>
          </motion.div>
        )}

        {/* Product lines */}
        {(profile?.productLines?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Product Lines</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile!.productLines.map((p) => (
                <span key={p} className="text-xs font-semibold px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Workspace summary */}
        {workspace && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Workspace</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Business</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{workspace.businessName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Location</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{workspace.city}, {workspace.state}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Team Type</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5 capitalize">{workspace.teamType}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Products</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{workspace.productInterests?.length ?? 0} selected</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Masked financial details read-only display */}
        {profile && (profile.panNumber || profile.bankAccountNumber) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">Financial Details</p>
              </div>
              <button
                onClick={() => setEditMode('financial')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Pencil size={11} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">PAN</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{profile.panNumber ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Bank Account</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{mask(profile.bankAccountNumber)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">IFSC</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{profile.ifscCode ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">GST</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">{profile.gstNumber ?? '—'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
