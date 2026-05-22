import { Suspense } from 'react';
import AcceptInvitePage from '@/features/auth/components/AcceptInvitePage';

export default function Page() {
  return (
    <Suspense>
      <AcceptInvitePage />
    </Suspense>
  );
}
