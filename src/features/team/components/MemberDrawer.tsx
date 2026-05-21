'use client';

import { Avatar, Drawer, IconButton, Chip } from '@mui/material';
import { SelectInputField, Button } from 'ev-ui-lab';
import { X, Phone, Mail, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { TeamMember, Role } from '../types/team.types';

interface MemberDrawerProps {
  member: TeamMember | null;
  roles: Role[];
  open: boolean;
  onClose: () => void;
  onUpdateRole: (memberId: string, roleId: string) => Promise<void>;
  onToggleActive: (memberId: string, isActive: boolean) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  owner:          { bg: 'bg-blue-100',   color: 'text-blue-700' },
  sub_agent:      { bg: 'bg-violet-100', color: 'text-violet-700' },
  telecaller:     { bg: 'bg-cyan-100',   color: 'text-cyan-700' },
  operations_user:{ bg: 'bg-amber-100',  color: 'text-amber-700' },
  viewer:         { bg: 'bg-slate-100',  color: 'text-slate-600' },
};

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MemberDrawer({
  member, roles, open, onClose, onUpdateRole, onToggleActive, onRemove,
}: MemberDrawerProps) {
  const [updatingRole, setUpdatingRole] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!member) return null;

  // member is guaranteed non-null below this point
  const m = member;

  const invitableRoles = roles.filter((r) => r.name !== 'owner');
  const roleStyle = ROLE_STYLE[m.role?.name ?? ''] ?? { bg: 'bg-slate-100', color: 'text-slate-600' };
  const roleName = m.role?.name?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Unknown';

  async function handleRoleChange(roleId: string) {
    if (roleId === m.roleId) return;
    setUpdatingRole(true);
    try { await onUpdateRole(m.id, roleId); }
    finally { setUpdatingRole(false); }
  }

  async function handleToggle() {
    setToggling(true);
    try { await onToggleActive(m.id, !m.isActive); }
    finally { setToggling(false); }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove(m.id);
      onClose();
    } finally {
      setRemoving(false);
      setConfirmRemove(false);
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 400 }, borderRadius: '16px 0 0 16px' } } }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Member Details</h2>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
            <X size={18} />
          </IconButton>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar
              sx={{
                width: 60, height: 60,
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
              }}
            >
              {getInitials(m.agent?.fullName ?? 'A')}
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-base leading-tight truncate">
                {m.agent?.fullName ?? '—'}
              </p>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${roleStyle.bg} ${roleStyle.color}`}>
                {roleName}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span>{m.agent?.mobile ?? '—'}</span>
            </div>
            {m.agent?.email && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{m.agent.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar size={15} className="text-slate-400 shrink-0" />
              <span>Joined {formatDate(m.joinedAt)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${m.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-700">{m.isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-slate-400">{m.isActive ? 'Can access workspace' : 'Login blocked'}</p>
              </div>
            </div>
            <Button
              text={toggling ? '…' : m.isActive ? 'Suspend' : 'Reactivate'}
              className={m.isActive ? 'outlinedBtn' : 'primaryBtn'}
              size="small"
              onClick={handleToggle}
              loader={toggling}
              disabled={toggling}
            />
          </div>

          {/* Role change */}
          {m.role?.name !== 'owner' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Change Role
              </p>
              <SelectInputField
                title=""
                value={m.roleId}
                attrName="role"
                value_update={(_attr, val) => handleRoleChange(val)}
                options={invitableRoles.map((r) => ({
                  value: r.id,
                  label: r.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                }))}
                disabled={updatingRole}
              />
            </div>
          )}

          {/* Role description */}
          {m.role?.description && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
              {m.role.description}
            </div>
          )}
        </div>

        {/* Danger zone — fixed at bottom */}
        {m.role?.name !== 'owner' && (
          <div className="px-6 py-4 border-t border-slate-100">
            {!confirmRemove ? (
              <button
                onClick={() => setConfirmRemove(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium py-2.5 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all"
              >
                <AlertTriangle size={14} />
                Remove from workspace
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">Remove {m.agent?.fullName?.split(' ')[0]}?</p>
                <p className="text-xs text-red-500">They will lose access immediately. Their records stay in the workspace.</p>
                <div className="flex gap-2">
                  <Button
                    text="Cancel"
                    className="outlinedBtn"
                    size="small"
                    onClick={() => setConfirmRemove(false)}
                    disabled={removing}
                  />
                  <Button
                    text={removing ? 'Removing…' : 'Yes, Remove'}
                    className="primaryBtn"
                    size="small"
                    onClick={handleRemove}
                    loader={removing}
                    disabled={removing}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
