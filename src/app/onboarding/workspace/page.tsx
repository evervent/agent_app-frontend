import { Suspense } from 'react';
import WorkspacePage from '@/features/onboarding/components/WorkspacePage';

export default function Page() {
  return (
    <Suspense>
      <WorkspacePage />
    </Suspense>
  );
}
