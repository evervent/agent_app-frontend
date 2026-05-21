'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { TextInputField, SelectInputField, Button } from 'ev-ui-lab';
import { Role } from '../types/team.types';

interface InviteDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onInvite: (mobile: string, roleId: string) => Promise<void>;
}

const ROLE_ACCESS: Record<string, { can: string[]; cannot: string[] }> = {
  sub_agent: {
    can: ['Create & manage leads', 'Manage customers', 'Create & edit quotes', 'View policies'],
    cannot: ['Invite team members', 'View full earnings', 'Change workspace settings'],
  },
  telecaller: {
    can: ['View assigned leads', 'Update lead status', 'View assigned customers'],
    cannot: ['Create quotes', 'View earnings', 'Invite team members'],
  },
  operations_user: {
    can: ['View & update leads', 'Manage customers', 'Edit quotes', 'Update policies'],
    cannot: ['Create leads', 'View earnings', 'Invite team members'],
  },
  viewer: {
    can: ['View leads', 'View customers', 'View quotes', 'View policies'],
    cannot: ['Create or edit anything', 'Invite team members', 'View earnings'],
  },
};

export default function InviteDialog({ open, roles, onClose, onInvite }: InviteDialogProps) {
  const [mobile, setMobile] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitableRoles = roles.filter((r) => r.name !== 'owner');
  const selectedRole = invitableRoles.find((r) => r.id === roleId);
  const accessInfo = selectedRole ? ROLE_ACCESS[selectedRole.name] : null;

  function handleClose() {
    if (loading) return;
    setMobile('');
    setRoleId('');
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!mobile.trim() || !roleId) {
      setError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onInvite(mobile.trim(), roleId);
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to invite member';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
        Invite Team Member
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <TextInputField
          title="Mobile Number"
          placeholder="e.g. 9876543210"
          value={mobile}
          attrName="mobile"
          value_update={(_attr, val) => setMobile(val)}
          validation_type="MOBILE"
          disabled={loading}
          max_length={15}
        />

        <SelectInputField
          title="Role"
          value={roleId}
          attrName="roleId"
          value_update={(_attr, val) => setRoleId(val)}
          options={invitableRoles.map((role) => ({
            value: role.id,
            label: role.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          }))}
          placeholder="Select role"
          disabled={loading}
        />

        {accessInfo && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs space-y-2">
            <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Role Access</p>
            <div>
              {accessInfo.can.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-emerald-700">
                  <span className="text-emerald-500">✓</span> {item}
                </div>
              ))}
            </div>
            <div>
              {accessInfo.cannot.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-slate-400">
                  <span>✕</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          text="Cancel"
          className="outlinedBtn"
          size="medium"
          onClick={handleClose}
          disabled={loading}
        />
        <Button
          text={loading ? 'Inviting…' : 'Invite'}
          className="primaryBtn"
          size="medium"
          onClick={handleSubmit}
          loader={loading}
          disabled={loading || !mobile.trim() || !roleId}
        />
      </DialogActions>
    </Dialog>
  );
}
