'use client';

import { Check, X } from 'lucide-react';
import { RoleModulePermission, MODULE_LABELS, ACCESS_SCOPE_LABELS } from '../types/roles.types';

interface Props {
  modulePermissions: RoleModulePermission[];
}

export default function AccessSummary({ modulePermissions }: Props) {
  const enabled = modulePermissions.filter((m) => m.isEnabled && m.accessScope !== 'no_access');
  const disabled = modulePermissions.filter((m) => !m.isEnabled || m.accessScope === 'no_access');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Access Summary</h3>

      {enabled.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Can Access</p>
          <ul className="space-y-1">
            {enabled.map((m) => (
              <li key={m.moduleKey} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={14} className="text-green-500 shrink-0" />
                <span className="font-medium">{MODULE_LABELS[m.moduleKey] ?? m.moduleKey}</span>
                <span className="text-gray-400 text-xs">— {ACCESS_SCOPE_LABELS[m.accessScope]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {disabled.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">No Access</p>
          <ul className="space-y-1">
            {disabled.map((m) => (
              <li key={m.moduleKey} className="flex items-center gap-2 text-sm text-gray-400">
                <X size={14} className="text-red-400 shrink-0" />
                <span>{MODULE_LABELS[m.moduleKey] ?? m.moduleKey}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {modulePermissions.length === 0 && (
        <p className="text-sm text-gray-400 italic">No modules configured yet.</p>
      )}
    </div>
  );
}
