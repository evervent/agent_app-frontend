'use client';

import { TextInputField, ValidationType } from 'ev-ui-lab';

interface FormInputProps {
  label: string;
  attrName?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  validationType?: ValidationType;
}

export default function FormInput({
  label,
  attrName = 'field',
  value = '',
  onChange,
  placeholder,
  error,
  required,
  maxLength,
  disabled,
  validationType,
}: FormInputProps) {
  return (
    <TextInputField
      title={label}
      value={value}
      attrName={attrName}
      value_update={(_attr, val) => onChange?.(val)}
      placeholder={placeholder}
      required={required}
      max_length={maxLength}
      disabled={disabled}
      warn_status={!!error}
      error_message={error}
      validation_type={validationType}
    />
  );
}
