export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import BroadcastClient from '@/components/admin/BroadcastClient';

type BroadcastPageProps = {
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

async function fetchSubscriptionCount(eventId: string) {
  const { count, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) {
    console.error('Subscription count error:', error);
    return 0;
  }

  return count || 0;
}

export default async function BroadcastPage({ params }: BroadcastPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, subscriptionCount] = await Promise.all([
    fetchEvent(eventId),
    fetchSubscriptionCount(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Push 알림 발송</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자에게 Push 알림을 발송하세요.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          현재 {subscriptionCount}명이 Push 알림을 구독 중입니다.
        </p>
      </div>

      {/* Broadcast 클라이언트 컴포넌트 */}
      <BroadcastClient eventId={eventId} subscriptionCount={subscriptionCount} />
    </div>
  );
}

