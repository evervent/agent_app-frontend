import { redirect } from 'next/navigation';

/**
 * /dashboard/roles is not a standalone page.
 * Roles & Permissions lives inside the dashboard shell (inline section).
 * Redirect to dashboard so the sidebar/topbar are always present.
 */
export default function RolesIndexPage() {
  redirect('/dashboard');
}
