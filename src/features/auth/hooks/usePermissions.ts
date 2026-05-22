import { useAuthStore } from '@/shared/store/authStore';

/** Roles and their granted permissions (mirrors backend roles-seed.service.ts) */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  sub_agent: [
    'leads.create', 'leads.read', 'leads.update',
    'customers.create', 'customers.read', 'customers.update',
    'quotes.create', 'quotes.read', 'quotes.update',
    'policies.read',
    'workspace.read',
  ],
  telecaller: [
    'leads.read', 'leads.update',
    'customers.read',
    'calls.create', 'calls.read', 'calls.update',
    'workspace.read',
  ],
  operations_user: [
    'leads.read', 'leads.update',
    'customers.read', 'customers.update',
    'quotes.read', 'quotes.update',
    'policies.read', 'policies.update',
    'workspace.read',
  ],
  viewer: [
    'leads.read',
    'customers.read',
    'quotes.read',
    'policies.read',
    'workspace.read',
  ],
};

interface JwtPayload {
  sub: string;
  mobile: string;
  role: string;
  workspaceId: string | null;
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    // Pad base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns RBAC helpers based on the role embedded in the current JWT.
 *
 * Usage:
 *   const { can, canAny, role } = usePermissions();
 *   if (can('leads', 'create')) { ... }
 */
export function usePermissions() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const payload = accessToken ? decodeJwt(accessToken) : null;
  const role = payload?.role ?? 'guest';

  function can(module: string, action: string): boolean {
    const perms = ROLE_PERMISSIONS[role] ?? [];
    return perms.includes('*') || perms.includes(`${module}.${action}`);
  }

  function canAny(...checks: [string, string][]): boolean {
    return checks.some(([m, a]) => can(m, a));
  }

  return { can, canAny, role };
}
