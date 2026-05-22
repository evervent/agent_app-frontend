'use client';

import { AccessScope, ACCESS_SCOPE_LABELS } from '../types/roles.types';

interface Props {
  scope: AccessScope;
  compact?: boolean;
}

const SCOPE_COLOUR: Record<AccessScope, string> = {
  no_access: 'bg-gray-100 text-gray-500',
  view_assigned: 'bg-blue-50 text-blue-700',
  manage_assigned: 'bg-amber-50 text-amber-700',
  manage_all: 'bg-green-50 text-green-700',
  own_only: 'bg-purple-50 text-purple-700',
  team_summary: 'bg-indigo-50 text-indigo-700',
};

export default function ScopeBadge({ scope, compact = false }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SCOPE_COLOUR[scope]}`}
    >
      {compact ? scope.replace(/_/g, ' ') : ACCESS_SCOPE_LABELS[scope]}
    </span>
  );
}
