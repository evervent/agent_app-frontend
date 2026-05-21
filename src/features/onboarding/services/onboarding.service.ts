/**
 * Onboarding-specific external API calls (not the backend).
 * Backend onboarding calls are in agentService.
 */

interface StateOption { name: string; }
interface Option { label: string; value: string; [key: string]: unknown; }

export const locationService = {
  /** Fetch all Indian states */
  getStates: async (): Promise<Option[]> => {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India' }),
    });
    const data = await res.json();
    return (data?.data?.states ?? [] as StateOption[])
      .map((s: StateOption) => ({ label: s.name, value: s.name }))
      .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
  },

  /** Fetch cities for a given Indian state */
  getCities: async (state: string): Promise<Option[]> => {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India', state }),
    });
    const data = await res.json();
    return (data?.data ?? [] as string[])
      .map((c: string) => ({ label: c, value: c }))
      .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
  },
};
