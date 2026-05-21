'use client';

import { ThemeProvider } from '@mui/material/styles';
import muiTheme from '@/shared/lib/muiTheme';

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
}
