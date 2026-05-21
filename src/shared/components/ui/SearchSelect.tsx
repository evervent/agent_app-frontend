'use client';

import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

interface Option { label: string; value: string; }

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
  name?: string;
}

export default function SearchSelect({
  label, options, value = '', onChange, placeholder, error, required, disabled, loading, name,
}: SearchSelectProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel
        required={required}
        sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}
      >
        {label}
      </InputLabel>
      <Autocomplete
        options={options}
        value={selected}
        disabled={disabled}
        loading={loading}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(o, v) => o.value === v.value}
        onChange={(_e, opt) => onChange(opt?.value ?? '')}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            error={!!error}
            placeholder={placeholder}
            slotProps={{
              ...params.slotProps,
              input: {
                ...(params.slotProps?.input as object),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={14} /> : null}
                    {(params.slotProps?.input as { endAdornment?: React.ReactNode })?.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      {error && <FormHelperText sx={{ color: '#ef4444', mt: 0.75, ml: 0, fontSize: '0.75rem' }}>{error}</FormHelperText>}
    </FormControl>
  );
}
