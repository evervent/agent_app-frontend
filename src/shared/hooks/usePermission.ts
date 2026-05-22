'use client';

import { useAuthStore } from '@/shared/store/authStore';

/**
 * Check if the current agent has a specific permission.
 * Owner always returns true (has '*' wildcard).
 *
 * @param permission - e.g. 'leads.create', 'workspace.manage_members'
 * @returns boolean
 *
 * @example
 * const canCreateLead = usePermission('leads.create');
 */
export function usePermission(permission: string): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Check if the current agent has ALL of the specified permissions.
 */
export function usePermissions(perms: string[]): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  if (permissions.includes('*')) return true;
  return perms.every((p) => permissions.includes(p));
}

/**
 * Check if the current agent has ANY of the specified permissions.
 */
export function useAnyPermission(perms: string[]): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  if (permissions.includes('*')) return true;
  return perms.some((p) => permissions.includes(p));
}
