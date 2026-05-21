'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { Role } from '../types/team.types';

interface InviteDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onInvite: (mobile: string, roleId: string) => Promise<void>;
}

export default function InviteDialog({ open, roles, onClose, onInvite }: InviteDialogProps) {
  const [mobile, setMobile] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitableRoles = roles.filter((r) => r.name !== 'owner');

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
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Mobile Number"
          placeholder="e.g. 9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          disabled={loading}
          fullWidth
          size="small"
          slotProps={{
            htmlInput: { maxLength: 15 },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {invitableRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !mobile.trim() || !roleId}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}
        >
          {loading ? 'Inviting…' : 'Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
