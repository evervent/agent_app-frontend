import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
    error:   { main: '#ef4444' },
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '& fieldset': { borderColor: '#cbd5e1' },
            '&:hover fieldset': { borderColor: '#93c5fd' },
            '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '2px' },
            '&.Mui-error fieldset': { borderColor: '#f87171' },
            '&.Mui-error.Mui-focused fieldset': { borderColor: '#ef4444', borderWidth: '2px' },
          },
          '& .MuiInputBase-input': {
            padding: '12px 16px',
            '&::placeholder': { color: '#94a3b8', opacity: 1 },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginLeft: 0,
            marginTop: '6px',
            '&.Mui-error': { color: '#ef4444' },
          },
        },
      },
    },
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#334155',
          position: 'static',
          transform: 'none',
          marginBottom: '6px',
          '&.Mui-focused': { color: '#2563eb' },
          '&.Mui-error':   { color: '#ef4444' },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { padding: '3px 14px' },
        },
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
          border: '1px solid #e2e8f0',
          marginTop: 4,
        },
        listbox: { padding: '4px' },
        option: {
          fontSize: '0.875rem',
          borderRadius: 8,
          '&[aria-selected="true"]': {
            backgroundColor: '#eff6ff !important',
            color: '#2563eb',
            fontWeight: 600,
          },
          '&:hover': { backgroundColor: '#f1f5f9 !important' },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: '0.75rem', marginLeft: 0 },
      },
    },
  },
});

export default muiTheme;
