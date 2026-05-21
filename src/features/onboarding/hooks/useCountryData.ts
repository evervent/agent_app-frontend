import { useState, useEffect } from 'react';
import { locationService } from '@/features/onboarding/services/onboarding.service';

interface Option { label: string; value: string; [key: string]: unknown; }

interface UseCountryDataResult {
  states: Option[];
  cities: Option[];
  citiesLoading: boolean;
  loadCities: (state: string) => void;
}

export function useCountryData(): UseCountryDataResult {
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    locationService.getStates().then(setStates).catch(() => {});
  }, []);

  function loadCities(state: string) {
    if (!state) { setCities([]); return; }
    setCitiesLoading(true);
    setCities([]);
    locationService.getCities(state)
      .then(setCities)
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }

  return { states, cities, citiesLoading, loadCities };
}
