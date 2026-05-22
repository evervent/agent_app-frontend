'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { TextInputField, SelectInputField, Button } from 'ev-ui-lab';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { Role } from '../types/team.types';

interface InviteDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onInvite: (identifier: string, roleId: string, byEmail?: boolean) => Promise<string>;
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
  const [byEmail, setByEmail] = useState(false);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const invitableRoles = roles.filter((r) => r.name !== 'owner');
  const selectedRole = invitableRoles.find((r) => r.id === roleId);
  const accessInfo = selectedRole ? ROLE_ACCESS[selectedRole.name] : null;

  function handleClose() {
    if (loading) return;
    setMobile('');
    setEmail('');
    setRoleId('');
    setError(null);
    setInviteLink(null);
    setCopied(false);
    onClose();
  }

  function handleCopy() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit() {
    const identifier = byEmail ? email.trim() : mobile.trim();
    if (!identifier || !roleId) {
      setError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = await onInvite(identifier, roleId, byEmail);
      const link = `${window.location.origin}/auth/accept-invite?token=${token}`;
      setInviteLink(link);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to invite member';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = byEmail ? email.trim().length > 0 && roleId : mobile.trim().length > 0 && roleId;

  // Success state — show invite link
  if (inviteLink) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          Invite Sent!
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-800">OTP sent to the invitee&apos;s mobile</p>
            <p className="text-xs text-slate-500 mt-1">
              Share this invite link — they&apos;ll need it along with the OTP to join.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Invite Link</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-700 break-all flex-1 font-mono leading-relaxed">{inviteLink}</p>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
                title="Copy link"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Link expires in 48 hours.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button text="Done" className="primaryBtn" size="medium" onClick={handleClose} />
        </DialogActions>
      </Dialog>
    );
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

        {/* Mobile / Email toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setByEmail(false); setEmail(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${!byEmail ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mobile Number
          </button>
          <button
            onClick={() => { setByEmail(true); setMobile(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${byEmail ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Email Address
          </button>
        </div>

        {!byEmail ? (
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
        ) : (
          <TextInputField
            title="Email Address"
            placeholder="e.g. agent@example.com"
            value={email}
            attrName="email"
            value_update={(_attr, val) => setEmail(val)}
            validation_type="EMAIL"
            disabled={loading}
          />
        )}

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
          disabled={loading || !canSubmit}
        />
      </DialogActions>
    </Dialog>
  );
}
