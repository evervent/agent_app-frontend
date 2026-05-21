'use client';

import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { forwardRef } from 'react';

interface FormInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, placeholder, error, required, type = 'text', maxLength, disabled, ...rest },
  ref,
) {
  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel required={required} sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
        {label}
      </InputLabel>
      <TextField
        inputRef={ref}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        error={!!error}
        slotProps={{ htmlInput: { maxLength } }}
        {...rest}
      />
      {error && <FormHelperText sx={{ color: '#ef4444', mt: 0.75, ml: 0, fontSize: '0.75rem' }}>{error}</FormHelperText>}
    </FormControl>
  );
});

export default FormInput;
