export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import VIPClient from '@/components/admin/VIPClient';

type VIPPageProps = {
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

async function fetchVIPParticipants(eventId: string) {
  // VIP 참가자 조회: vip_level > 0 이거나 guest_of IS NOT NULL
  const { data: vipParticipants, error } = await supabaseAdmin
    .from('event_participants')
    .select(`
      id,
      name,
      email,
      company,
      vip_level,
      guest_of,
      vip_note,
      status,
      event_participants!guest_of (
        id,
        name,
        email
      )
    `)
    .eq('event_id', eventId)
    .or('vip_level.gt.0,guest_of.not.is.null')
    .order('vip_level', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('VIP participants fetch error:', error);
    return [];
  }

  return vipParticipants || [];
}

export default async function VIPPage({ params }: VIPPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, vipParticipants] = await Promise.all([
    fetchEvent(eventId),
    fetchVIPParticipants(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // 데이터 변환: guest_of 관계 해결
  const transformedVIPs = vipParticipants.map((vip: any) => ({
    id: vip.id,
    name: vip.name,
    email: vip.email,
    company: vip.company,
    vipLevel: vip.vip_level || 0,
    guestOf: vip.guest_of,
    guestOfName: vip.event_participants?.name || null,
    guestOfEmail: vip.event_participants?.email || null,
    vipNote: vip.vip_note,
    status: vip.status,
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">VIP 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - VIP 참가자를 관리하세요.
        </p>
      </div>

      {/* VIP 클라이언트 컴포넌트 */}
      <VIPClient eventId={eventId} vipParticipants={transformedVIPs} />
    </div>
  );
}

