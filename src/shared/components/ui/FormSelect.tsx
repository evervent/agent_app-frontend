'use client';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

interface Option { label: string; value: string | number; }

interface FormSelectProps {
  label: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export default function FormSelect({
  label, options, value = '', onChange, error, placeholder, required, disabled, name,
}: FormSelectProps) {
  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel
        id={`${name}-label`}
        required={required}
        sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        name={name}
        value={value}
        disabled={disabled}
        displayEmpty
        onChange={(e) => onChange?.(e.target.value as string)}
        sx={{
          backgroundColor: '#fff',
          fontSize: '0.875rem',
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#93c5fd' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: 2 },
          '& .MuiSelect-select': { padding: '12px 16px' },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: '#f87171' },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
                border: '1px solid #e2e8f0',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  mx: 0.5,
                  '&.Mui-selected': { bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600 },
                  '&:hover': { bgcolor: '#f1f5f9' },
                },
              },
            },
          },
        }}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={{ color: '#94a3b8' }}>{placeholder}</MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
      {error && <FormHelperText sx={{ color: '#ef4444', mt: 0.75, ml: 0, fontSize: '0.75rem' }}>{error}</FormHelperText>}
    </FormControl>
  );
}
