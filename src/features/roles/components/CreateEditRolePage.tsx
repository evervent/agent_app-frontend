'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createRole,
  getRole,
  updateRole,
  setModulePermissions,
} from '../services/roles.service';
import {
  MODULE_KEYS,
  AccessScope,
  ModulePermissionPayload,
  RoleWithPermissions,
} from '../types/roles.types';
import ModulePermissionCard from './ModulePermissionCard';
import AccessSummary from './AccessSummary';

// Default module config (no access) for all modules
function buildDefaultModules(): ModulePermissionPayload[] {
  return MODULE_KEYS.map((key) => ({
    moduleKey: key,
    isEnabled: false,
    accessScope: 'no_access' as AccessScope,
    actions: [],
  }));
}

function hydrateFromServerData(serverPerms: RoleWithPermissions['modulePermissions']): ModulePermissionPayload[] {
  const base = buildDefaultModules();
  for (const rmp of serverPerms) {
    const idx = base.findIndex((m) => m.moduleKey === rmp.moduleKey);
    if (idx !== -1) {
      base[idx] = {
        moduleKey: rmp.moduleKey,
        isEnabled: rmp.isEnabled,
        accessScope: rmp.accessScope,
        actions: rmp.actions.map((a) => ({ actionKey: a.actionKey, isAllowed: a.isAllowed })),
      };
    }
  }
  return base;
}

interface Props {
  /** When provided, we're editing an existing custom role. */
  roleId?: string;
}

export default function CreateEditRolePage({ roleId }: Props) {
  const router = useRouter();
  const isEdit = !!roleId;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [modules, setModules] = useState<ModulePermissionPayload[]>(buildDefaultModules());
  const [saving, setSaving] = useState(false);
  const [existingRole, setExistingRole] = useState<RoleWithPermissions | null>(null);
  // Track a role that was created but whose permissions failed, so retry updates instead of re-creating
  const [partialRoleId, setPartialRoleId] = useState<string | null>(null);

  // Load existing role for edit mode
  useEffect(() => {
    if (!isEdit || !roleId) return;
    getRole(roleId).then((r) => {
      setExistingRole(r);
      setName(r.name);
      setDescription(r.description ?? '');
      setIsActive(r.isActive);
      setModules(hydrateFromServerData(r.modulePermissions));
    }).catch(() => toast.error('Failed to load role'));
  }, [isEdit, roleId]);

  function handleModuleChange(idx: number, updated: ModulePermissionPayload) {
    setModules((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Role name is required');
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      let id = roleId ?? partialRoleId;
      if (isEdit && roleId) {
        await updateRole(roleId, { name, description: description || undefined, isActive });
        await setModulePermissions(roleId, { modules });
        toast.success('Role updated');
      } else if (id) {
        // Retry after partial failure — role exists, just set permissions
        await updateRole(id, { name, description: description || undefined });
        await setModulePermissions(id, { modules });
        toast.success('Role created');
      } else {
        const created = await createRole({ name, description: description || undefined });
        id = created.id;
        setPartialRoleId(id);
        await setModulePermissions(id, { modules });
        toast.success('Role created');
      }
      router.push('/dashboard/roles');
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSaving(false);
    }
  }

  // ─── Step indicators ────────────────────────────────────────────────────────
  const steps = [
    { n: 1 as const, label: 'Basics' },
    { n: 2 as const, label: 'Permissions' },
    { n: 3 as const, label: 'Review' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {isEdit ? 'Edit Role' : 'Create Custom Role'}
        </h1>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {steps.map((s) => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${step === s.n
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      {/* ── Step 1: Basics ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Agent, Relationship Manager"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this role do?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-indigo-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </label>
              <span className="text-sm text-gray-700">Active</span>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Permissions ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Configure which modules this role can access and what actions are allowed.
          </p>
          {modules.map((m, idx) => (
            <ModulePermissionCard
              key={m.moduleKey}
              moduleKey={m.moduleKey}
              value={m}
              onChange={(updated) => handleModuleChange(idx, updated)}
            />
          ))}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ──────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="text-gray-900 font-semibold">{name || '—'}</span>
            </div>
            {description && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Description</span>
                <span className="text-gray-700 max-w-xs text-right">{description}</span>
              </div>
            )}
          </div>

          <AccessSummary modulePermissions={
            // Convert payload to display shape
            modules
              .filter((m) => m.isEnabled && m.accessScope !== 'no_access')
              .map((m) => ({
                id: '',
                roleId: '',
                moduleKey: m.moduleKey,
                isEnabled: m.isEnabled,
                accessScope: m.accessScope,
                actions: m.actions.map((a) => ({
                  id: '',
                  roleModulePermissionId: '',
                  actionKey: a.actionKey,
                  isAllowed: a.isAllowed,
                })),
              }))
          } />

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
