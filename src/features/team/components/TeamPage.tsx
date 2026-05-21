'use client';

import { useState } from 'react';
import { Button, TextInputField } from 'ev-ui-lab';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTeamMembers } from '../hooks/useTeamMembers';
import InviteDialog from './InviteDialog';
import MemberCard from './MemberCard';
import MemberDrawer from './MemberDrawer';
import { TeamMember } from '../types/team.types';

export default function TeamPage() {
  const { members, roles, loading, error, inviteMember, updateMember, removeMember, refetch } =
    useTeamMembers();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null);
  const drawerMember: TeamMember | null = members.find((m) => m.id === drawerMemberId) ?? null;

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.agent?.fullName?.toLowerCase().includes(q) ||
      m.agent?.mobile?.includes(q) ||
      m.role?.name?.toLowerCase().includes(q)
    );
  });

  async function handleInvite(identifier: string, roleId: string, byEmail?: boolean) {
    const payload = byEmail ? { email: identifier, roleId } : { mobile: identifier, roleId };
    await inviteMember(payload);
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
      if (drawerMemberId === memberId) setDrawerMemberId(null);
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
          text="Invite Member"
          className="primaryBtn"
          size="medium"
          onClick={() => setInviteOpen(true)}
          startIcon={<UserPlus size={16} />}
        />
      </motion.div>

      {/* Status summary cards */}
      {!loading && members.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Total Members', value: members.length, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
            { label: 'Active', value: members.filter((m) => m.isActive).length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Inactive', value: members.filter((m) => !m.isActive).length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
            { label: 'Roles', value: [...new Set(members.map((m) => m.roleId))].length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`border rounded-xl px-4 py-3 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search */}
      {!loading && members.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="max-w-sm">
            <TextInputField
              title=""
              placeholder="Search by name, mobile or role…"
              value={search}
              attrName="search"
              value_update={(_attr, val) => setSearch(val)}
            />
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
          <Button text="Retry" className="textBtn" size="small" onClick={refetch} />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[76px] bg-slate-100 animate-pulse rounded-2xl" />
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
                    onClick={() => setDrawerMemberId(member.id)}
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
                <div className="mt-3">
                  <Button
                    text="Invite your first member"
                    className="outlinedBtn"
                    size="medium"
                    onClick={() => setInviteOpen(true)}
                    startIcon={<UserPlus size={15} />}
                  />
                </div>
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

      {/* Member Detail Drawer */}
      <MemberDrawer
        member={drawerMember}
        roles={roles}
        open={!!drawerMemberId}
        onClose={() => setDrawerMemberId(null)}
        onUpdateRole={handleUpdateRole}
        onToggleActive={handleToggleActive}
        onRemove={handleRemove}
      />
    </div>
  );
}
