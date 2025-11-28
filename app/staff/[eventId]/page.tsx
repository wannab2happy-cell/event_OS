export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { assertEventStaffAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type StaffEventPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function StaffEventPage({ params }: StaffEventPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return redirect('/admin/login');
  }

  // 권한 체크
  await assertEventStaffAuth(eventId);

  // 기본적으로 scan 페이지로 리다이렉트
  return redirect(`/staff/${eventId}/scan`);
}

