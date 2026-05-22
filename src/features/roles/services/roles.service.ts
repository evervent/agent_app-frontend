import { api } from '@/lib/api';
import type {
  RoleListItem,
  RoleWithPermissions,
  CreateCustomRolePayload,
  UpdateCustomRolePayload,
  SetModulePermissionsPayload,
} from '../types/roles.types';

/** List all roles in the current workspace (system + custom). */
export async function listRoles(): Promise<RoleListItem[]> {
  const { data } = await api.get<RoleListItem[]>('/roles');
  return data;
}

/** Get full role detail including module permissions. */
export async function getRole(id: string): Promise<RoleWithPermissions> {
  const { data } = await api.get<RoleWithPermissions>(`/roles/${id}`);
  return data;
}

/** Create a new custom role. */
export async function createRole(payload: CreateCustomRolePayload): Promise<RoleListItem> {
  const { data } = await api.post<RoleListItem>('/roles', payload);
  return data;
}

/** Update name, description, or isActive. */
export async function updateRole(id: string, payload: UpdateCustomRolePayload): Promise<RoleListItem> {
  const { data } = await api.put<RoleListItem>(`/roles/${id}`, payload);
  return data;
}

/** Delete a custom role. */
export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}

/** Duplicate an existing role into a new custom role. */
export async function duplicateRole(id: string, newName: string): Promise<RoleListItem> {
  const { data } = await api.post<RoleListItem>(`/roles/${id}/duplicate`, { newName });
  return data;
}

/** Replace the full module-permission config of a custom role. */
export async function setModulePermissions(
  id: string,
  payload: SetModulePermissionsPayload,
): Promise<{ updated: number }> {
  const { data } = await api.put<{ updated: number }>(`/roles/${id}/module-permissions`, payload);
  return data;
}
