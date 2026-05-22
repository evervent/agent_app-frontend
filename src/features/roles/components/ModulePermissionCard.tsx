'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  AccessScope,
  ACCESS_SCOPE_LABELS,
  ACTION_KEYS,
  ModulePermissionPayload,
  ModuleActionPayload,
  MODULE_LABELS,
} from '../types/roles.types';
import ScopeBadge from './ScopeBadge';

const SCOPES: AccessScope[] = [
  'no_access',
  'view_assigned',
  'manage_assigned',
  'manage_all',
];

interface Props {
  moduleKey: string;
  value: ModulePermissionPayload;
  onChange: (v: ModulePermissionPayload) => void;
  readOnly?: boolean;
}

export default function ModulePermissionCard({ moduleKey, value, onChange, readOnly = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleScopeChange(scope: AccessScope) {
    const isEnabled = scope !== 'no_access';
    onChange({ ...value, accessScope: scope, isEnabled });
  }

  function handleActionToggle(actionKey: string, isAllowed: boolean) {
    const existing = value.actions.filter((a) => a.actionKey !== actionKey);
    const next: ModuleActionPayload[] = [...existing, { actionKey, isAllowed }];
    onChange({ ...value, actions: next });
  }

  function isActionAllowed(actionKey: string): boolean {
    return value.actions.find((a) => a.actionKey === actionKey)?.isAllowed ?? false;
  }

  const hasAccess = value.accessScope !== 'no_access';

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm text-gray-900">
            {MODULE_LABELS[moduleKey] ?? moduleKey}
          </span>
          {!expanded && <ScopeBadge scope={value.accessScope} />}
        </div>

        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setExpanded((p) => !p)}
          aria-label="Toggle expand"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-4">
          {/* Access scope selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Access Scope
            </p>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && handleScopeChange(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors
                    ${value.accessScope === s
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }
                    ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  `}
                >
                  {ACCESS_SCOPE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Action toggles — only shown when access granted */}
          {hasAccess && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Allowed Actions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACTION_KEYS.map((key) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 text-sm text-gray-700 ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={isActionAllowed(key)}
                      onChange={(e) => !readOnly && handleActionToggle(key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
