'use client';

import {
  Avatar,
  Chip,
  IconButton,
  MenuItem,
  Tooltip,
  Menu,
} from '@mui/material';
import { SelectInputField } from 'ev-ui-lab';
import { motion } from 'framer-motion';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TeamMember, Role } from '../types/team.types';

interface MemberCardProps {
  member: TeamMember;
  roles: Role[];
  onUpdateRole: (memberId: string, roleId: string) => Promise<void>;
  onToggleStatus: (memberId: string, newStatus: 'active' | 'suspended') => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
  onClick?: () => void;
}

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  owner:          { bg: '#dbeafe', color: '#1d4ed8', label: 'Owner' },
  sub_agent:      { bg: '#ede9fe', color: '#6d28d9', label: 'Sub Agent' },
  telecaller:     { bg: '#cffafe', color: '#0e7490', label: 'Telecaller' },
  operations_user:{ bg: '#fef3c7', color: '#b45309', label: 'Operations' },
  support_user:   { bg: '#fef3c7', color: '#b45309', label: 'Support' },
  viewer:         { bg: '#f1f5f9', color: '#475569', label: 'Viewer' },
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MemberCard({ member, roles, onUpdateRole, onToggleStatus, onRemove, onClick }: MemberCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [toggling, setToggling] = useState(false);

  const roleStyle = ROLE_STYLE[member.role?.name] ?? { bg: '#f1f5f9', color: '#475569', label: member.role?.name ?? 'Unknown' };
  const invitableRoles = roles.filter((r) => r.name !== 'owner');

  async function handleRoleChange(roleId: string) {
    if (roleId === member.roleId) return;
    setUpdatingRole(true);
    try {
      await onUpdateRole(member.id, roleId);
    } finally {
      setUpdatingRole(false);
    }
  }

  async function handleToggle() {
    setToggling(true);
    try {
      const newStatus = member.status === 'active' ? 'suspended' : 'active';
      await onToggleStatus(member.id, newStatus);
    } finally {
      setToggling(false);
    }
  }

  async function handleRemove() {
    setMenuAnchor(null);
    await onRemove(member.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          fontWeight: 700,
          fontSize: '0.85rem',
          flexShrink: 0,
        }}
      >
        {getInitials(member.agent?.fullName ?? 'A')}
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">
          {member.agent?.fullName ?? '—'}
        </p>
        <p className="text-slate-400 text-xs mt-0.5 truncate">{member.agent?.mobile}</p>
      </div>

      {/* Role selector on md+ */}
      <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <SelectInputField
          title=""
          value={member.roleId}
          attrName="role"
          value_update={(_attr, val) => handleRoleChange(val)}
          options={invitableRoles.map((role) => ({
            value: role.id,
            label: role.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          }))}
          disabled={updatingRole}
        />
      </div>

      {/* Status chip */}
      <Chip
        label={
          member.status === 'active' ? 'Active'
          : member.status === 'suspended' ? 'Suspended'
          : member.status === 'invited' ? 'Invited'
          : 'Inactive'
        }
        size="small"
        onClick={
          (member.status === 'active' || member.status === 'suspended') && !toggling
            ? (e) => { e.stopPropagation(); handleToggle(); }
            : undefined
        }
        sx={{
          cursor: (member.status === 'active' || member.status === 'suspended') ? 'pointer' : 'default',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 24,
          backgroundColor:
            member.status === 'active' ? '#dcfce7'
            : member.status === 'suspended' ? '#fff3cd'
            : member.status === 'invited' ? '#dbeafe'
            : '#fee2e2',
          color:
            member.status === 'active' ? '#15803d'
            : member.status === 'suspended' ? '#b45309'
            : member.status === 'invited' ? '#1d4ed8'
            : '#b91c1c',
          border: `1px solid ${
            member.status === 'active' ? '#bbf7d0'
            : member.status === 'suspended' ? '#fde68a'
            : member.status === 'invited' ? '#bfdbfe'
            : '#fecaca'
          }`,
          '&:hover': {
            backgroundColor:
              member.status === 'active' ? '#bbf7d0'
              : member.status === 'suspended' ? '#fde68a'
              : undefined,
          },
        }}
      />

      {/* Actions menu */}
      <Tooltip title="Actions">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
          sx={{ color: '#94a3b8' }}
        >
          <MoreVertical size={16} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160 } } }}
      >
        <MenuItem
          onClick={handleRemove}
          sx={{ color: '#dc2626', fontSize: '0.85rem', gap: 1.5 }}
        >
          <Trash2 size={14} />
          Remove member
        </MenuItem>
      </Menu>
    </motion.div>
  );
}
