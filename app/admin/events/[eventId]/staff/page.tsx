export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StaffEventManageClient from '@/components/admin/StaffEventManageClient';

type StaffEventManagePageProps = {
  params: Promise<{ eventId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchEventStaff(eventId: string) {
  // event_staff join users (auth.users)
  const { data: eventStaff, error } = await supabaseAdmin
    .from('event_staff')
    .select('id, user_id, role, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Event staff fetch error:', error);
    return [];
  }

  // auth.users에서 이메일 가져오기
  const staffWithEmails = await Promise.all(
    (eventStaff || []).map(async (es) => {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(es.user_id);
      return {
        id: es.id,
        userId: es.user_id,
        role: es.role,
        email: user?.user?.email || '알 수 없음',
        name: user?.user?.user_metadata?.name || user?.user?.email || '알 수 없음',
        createdAt: es.created_at,
      };
    })
  );

  return staffWithEmails;
}

export default async function StaffEventManagePage({ params }: StaffEventManagePageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, staffList] = await Promise.all([fetchEvent(eventId), fetchEventStaff(eventId)]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Staff 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 이벤트별 스태프 권한을 관리하세요.
        </p>
      </div>
      <StaffEventManageClient eventId={eventId} staffList={staffList} />
    </div>
  );
}

