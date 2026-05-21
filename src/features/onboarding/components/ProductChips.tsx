'use client';

const DEFAULT_PRODUCTS = [
  { label: 'Health' },
  { label: 'Car' },
  { label: 'Two-Wheeler' },
  { label: 'Term' },
  { label: 'Travel' },
];

interface ProductChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  label?: string;
  items?: Array<{ label: string }>;
}

export default function ProductChips({ value, onChange, error, label = 'Product Lines', items = DEFAULT_PRODUCTS }: ProductChipsProps) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => {
          const selected = value.includes(p.label);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => toggle(p.label)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:-translate-y-0.5 ${
                selected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
