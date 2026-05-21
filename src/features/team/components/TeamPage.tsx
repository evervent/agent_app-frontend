'use client';

import { useState } from 'react';
import {
  Button,
  TextField,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTeamMembers } from '../hooks/useTeamMembers';
import InviteDialog from './InviteDialog';
import MemberCard from './MemberCard';

export default function TeamPage() {
  const { members, roles, loading, error, inviteMember, updateMember, removeMember, refetch } =
    useTeamMembers();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.agent?.fullName?.toLowerCase().includes(q) ||
      m.agent?.mobile?.includes(q) ||
      m.role?.name?.toLowerCase().includes(q)
    );
  });

  async function handleInvite(mobile: string, roleId: string) {
    await inviteMember({ mobile, roleId });
    toast.success('Member invited successfully');
  }

  async function handleUpdateRole(memberId: string, roleId: string) {
    try {
      await updateMember(memberId, { roleId });
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
      refetch();
    }
  }

  async function handleToggleActive(memberId: string, isActive: boolean) {
    try {
      await updateMember(memberId, { isActive });
      toast.success(isActive ? 'Member activated' : 'Member deactivated');
    } catch {
      toast.error('Failed to update member status');
      refetch();
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeMember(memberId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  }

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your workspace members and their roles
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<UserPlus size={16} />}
          onClick={() => setInviteOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
            px: 2.5,
            py: 1,
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
              boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
            },
          }}
        >
          Invite Member
        </Button>
      </motion.div>

      {/* Search */}
      {!loading && members.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <TextField
            placeholder="Search by name, mobile or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              },
            }}
          />
        </motion.div>
      )}

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button size="small" onClick={refetch} sx={{ textTransform: 'none' }}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: 3 }} />
          ))}
        </div>
      )}

      {/* Member list */}
      {!loading && !error && (
        <>
          {filtered.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    roles={roles}
                    onUpdateRole={handleUpdateRole}
                    onToggleActive={handleToggleActive}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-slate-700 font-bold text-base">
                {search ? 'No members found' : 'No team members yet'}
              </h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                {search
                  ? 'Try a different search term'
                  : 'Invite agents to collaborate in your workspace'}
              </p>
              {!search && (
                <Button
                  variant="outlined"
                  startIcon={<UserPlus size={15} />}
                  onClick={() => setInviteOpen(true)}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#2563eb',
                    color: '#2563eb',
                  }}
                >
                  Invite your first member
                </Button>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Invite Dialog */}
      <InviteDialog
        open={inviteOpen}
        roles={roles}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
