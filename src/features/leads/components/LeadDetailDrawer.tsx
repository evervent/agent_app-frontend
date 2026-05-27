'use client';

import { Drawer } from '@mui/material';
import { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Trash2, Pencil } from 'lucide-react';
import { SelectInputField, Button } from 'ev-ui-lab';
import {
  Lead,
  LeadStatus,
  UpdateLeadPayload,
  LEAD_STATUS_LABELS,
  LEAD_PRODUCT_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_PRIORITY_LABELS,
} from '../types/leads.types';
import LeadStatusBadge from './LeadStatusBadge';

interface Props {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onUpdate: (id: string, payload: UpdateLeadPayload) => Promise<Lead>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_ITEMS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ label, value }));

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function LeadDetailDrawer({ open, lead, onClose, onEdit, onUpdate, onDelete }: Props) {
  const [statusValue, setStatusValue] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setStatusValue(lead.status);
      setNotes(lead.notes ?? '');
      setLostReason(lead.lostReason ?? '');
      setDeleteConfirm(false);
      setError(null);
    }
  }, [lead]);

  async function handleStatusChange(newStatus: string) {
    if (!lead || newStatus === lead.status) return;
    setStatusValue(newStatus);
    setStatusLoading(true);
    setError(null);
    try {
      const payload: UpdateLeadPayload = {
        status: newStatus as LeadStatus,
        ...(newStatus === LeadStatus.LOST && lostReason ? { lostReason } : {}),
      };
      await onUpdate(lead.id, payload);
    } catch {
      setStatusValue(lead.status);
      setError('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSaveNotes() {
    if (!lead) return;
    setNotesLoading(true);
    setError(null);
    try {
      await onUpdate(lead.id, { notes: notes.trim() || undefined });
    } catch {
      setError('Failed to save notes');
    } finally {
      setNotesLoading(false);
    }
  }

  async function handleDelete() {
    if (!lead) return;
    setDeleteLoading(true);
    try {
      await onDelete(lead.id);
      onClose();
    } catch {
      setError('Failed to delete lead');
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  }

  if (!lead) return null;

  const createdDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const followupDate = lead.nextFollowupAt
    ? new Date(lead.nextFollowupAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, borderRadius: '16px 0 0 16px' } } }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
              {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{lead.name}</p>
              <p className="text-xs text-slate-400">Added {createdDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(lead)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Status changer */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status</p>
            <div>
              <SelectInputField
                title="Change Status"
                attrName="status"
                value={statusValue}
                value_update={(_, v) => handleStatusChange(v)}
                options={STATUS_ITEMS}
                disabled={statusLoading}
              />
            </div>
            {statusValue === LeadStatus.LOST && (
              <div className="mt-2">
                <textarea
                  rows={2}
                  placeholder="Reason for losing this lead…"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}
          </section>

          {/* Info */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Info</p>
            <div className="space-y-3">
              <InfoRow icon={<Phone className="w-3.5 h-3.5 text-slate-400" />} label="Mobile" value={lead.mobile} />
              <InfoRow icon={<Mail className="w-3.5 h-3.5 text-slate-400" />} label="Email" value={lead.email} />
              <InfoRow icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />} label="Location" value={[lead.city, lead.state].filter(Boolean).join(', ')} />
            </div>
          </section>

          {/* Lead details */}
          <section>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Lead Details</p>
            <div className="grid grid-cols-2 gap-2">
              {lead.productInterest && (
                <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Product</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{LEAD_PRODUCT_LABELS[lead.productInterest]}</p>
                </div>
              )}
              {lead.source && (
                <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Source</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{LEAD_SOURCE_LABELS[lead.source]}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Priority</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{LEAD_PRIORITY_LABELS[lead.priority]}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            </div>
            {followupDate && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Follow-up: <span className="font-semibold">{followupDate}</span></span>
              </div>
            )}
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</p>
              <button
                onClick={handleSaveNotes}
                disabled={notesLoading || notes === (lead.notes ?? '')}
                className="text-xs font-semibold text-blue-600 disabled:text-slate-300 hover:text-blue-700 transition-colors"
              >
                {notesLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Add notes or remarks…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </section>
        </div>

        {/* Footer / delete */}
        <div className="px-5 py-4 border-t border-slate-100">
          {deleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600 flex-1">Delete this lead?</p>
              <Button
                text="Cancel"
                className="secondaryBtn"
                size="small"
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteLoading}
              />
              <Button
                text={deleteLoading ? 'Deleting…' : 'Delete'}
                className="dangerBtn"
                size="small"
                onClick={handleDelete}
                disabled={deleteLoading}
              />
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
