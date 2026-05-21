'use client';

import { SelectInputField } from 'ev-ui-lab';

interface Option { label: string; value: string | number; }

interface FormSelectProps {
  label: string;
  attrName?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function FormSelect({
  label, attrName = 'field', options, value = '', onChange, error, placeholder, required, disabled,
}: FormSelectProps) {
  return (
    <SelectInputField
      title={label}
      value={value}
      attrName={attrName}
      value_update={(_attr, val) => onChange?.(val)}
      options={options.map((o) => ({ label: o.label, value: String(o.value) }))}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      warn_status={!!error}
      error_message={error}
    />
  );
}
