import { useState, useEffect, useCallback } from 'react';
import { TeamMember, Role, InviteMemberPayload, UpdateMemberPayload } from '../types/team.types';
import { teamService } from '../services/team.service';

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersRes, rolesRes] = await Promise.all([
        teamService.getMembers(),
        teamService.getRoles(),
      ]);
      setMembers(membersRes.data);
      setRoles(rolesRes.data);
    } catch {
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const inviteMember = useCallback(async (payload: InviteMemberPayload): Promise<void> => {
    const res = await teamService.inviteMember(payload);
    setMembers((prev) => [...prev, res.data]);
  }, []);

  const updateMember = useCallback(async (memberId: string, payload: UpdateMemberPayload): Promise<void> => {
    const res = await teamService.updateMember(memberId, payload);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
  }, []);

  const removeMember = useCallback(async (memberId: string): Promise<void> => {
    await teamService.removeMember(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  return {
    members,
    roles,
    loading,
    error,
    refetch: fetchMembers,
    inviteMember,
    updateMember,
    removeMember,
  };
}
