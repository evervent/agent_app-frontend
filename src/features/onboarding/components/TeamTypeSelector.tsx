'use client';

import { Users, User } from 'lucide-react';

interface TeamTypeSelectorProps {
  value: 'solo' | 'team' | '';
  onChange: (v: 'solo' | 'team') => void;
  error?: string;
}

const OPTIONS: Array<{ value: 'solo' | 'team'; label: string; description: string; Icon: React.ElementType }> = [
  { value: 'solo', label: 'Solo Agent',  description: 'I work independently',     Icon: User  },
  { value: 'team', label: 'Team Agency', description: 'I manage a team of agents', Icon: Users },
];

export default function TeamTypeSelector({ value, onChange, error }: TeamTypeSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">
        Team Type <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map(({ value: v, label, description, Icon }) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                selected
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
              <p className={`text-sm font-semibold ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
