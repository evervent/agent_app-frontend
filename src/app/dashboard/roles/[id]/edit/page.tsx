'use client';

import { use } from 'react';
import CreateEditRolePage from '@/features/roles/components/CreateEditRolePage';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditRolePage({ params }: Props) {
  const { id } = use(params);
  return <CreateEditRolePage roleId={id} />;
}
