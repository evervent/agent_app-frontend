// ─── Custom Roles — Frontend Types ──────────────────────────────────────────

export type AccessScope =
  | 'no_access'
  | 'view_assigned'
  | 'manage_assigned'
  | 'manage_all'
  | 'own_only'
  | 'team_summary';

export type RoleType = 'system' | 'custom';

export interface RoleModuleAction {
  id: string;
  roleModulePermissionId: string;
  actionKey: string;
  isAllowed: boolean;
}

export interface RoleModulePermission {
  id: string;
  roleId: string;
  moduleKey: string;
  accessScope: AccessScope;
  isEnabled: boolean;
  actions: RoleModuleAction[];
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  workspaceId: string | null;
  roleType: RoleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleWithPermissions extends RoleListItem {
  modulePermissions: RoleModulePermission[];
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateCustomRolePayload {
  name: string;
  description?: string;
  /** UUID of an existing role to copy module permissions from */
  copyFromRoleId?: string;
}

export interface UpdateCustomRolePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ModuleActionPayload {
  actionKey: string;
  isAllowed: boolean;
}

export interface ModulePermissionPayload {
  moduleKey: string;
  isEnabled: boolean;
  accessScope: AccessScope;
  actions: ModuleActionPayload[];
}

export interface SetModulePermissionsPayload {
  modules: ModulePermissionPayload[];
}

// ─── Static constants (code-defined, not fetched from API) ───────────────────

export const MODULE_KEYS = [
  'leads',
  'customers',
  'quotes',
  'quote_history',
  'policies',
  'renewals',
  'documents',
  'claims',
  'payments',
  'calls',
  'tasks',
  'reports',
  'earnings',
  'dashboard',
  'team',
  'roles',
  'workspace_settings',
  'notifications',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const ACTION_KEYS = [
  'view',
  'create',
  'edit',
  'delete',
  'assign',
  'export',
  'upload',
  'download',
  'manage',
  'invite',
  'suspend',
  'remove',
  'duplicate',
] as const;

export type ActionKey = (typeof ACTION_KEYS)[number];

export const ACCESS_SCOPE_LABELS: Record<AccessScope, string> = {
  no_access: 'No Access',
  view_assigned: 'View (Assigned)',
  manage_assigned: 'Manage (Assigned)',
  manage_all: 'Manage All',
  own_only: 'Own Only',
  team_summary: 'Team Summary',
};

export const MODULE_LABELS: Record<string, string> = {
  leads: 'Leads',
  customers: 'Customers',
  quotes: 'Quotes',
  quote_history: 'Quote History',
  policies: 'Policies',
  renewals: 'Renewals',
  documents: 'Documents',
  claims: 'Claims',
  payments: 'Payments',
  calls: 'Calls',
  tasks: 'Tasks',
  reports: 'Reports',
  earnings: 'Earnings',
  dashboard: 'Dashboard',
  team: 'Team',
  roles: 'Roles & Permissions',
  workspace_settings: 'Workspace Settings',
  notifications: 'Notifications',
};
