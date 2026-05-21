'use client';

import { SelectInputField } from 'ev-ui-lab';

interface Option { label: string; value: string; [key: string]: unknown; }

interface SearchSelectProps {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export default function SearchSelect({
  label, options, value = '', onChange, placeholder, error, required, disabled,
}: SearchSelectProps) {
  return (
    <SelectInputField
      title={label}
      attrName={label}
      value={value}
      value_update={(_attr, val) => onChange(val)}
      options={options.map((o) => ({ label: o.label, value: String(o.value) }))}
      placeholder={placeholder || `Select ${label}…`}
      required={required}
      disabled={disabled}
      warn_status={!!error}
      error_message={error}
    />
  );
}
