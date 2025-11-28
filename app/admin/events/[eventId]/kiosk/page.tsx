export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import KioskSettingsClient from '@/components/admin/KioskSettingsClient';

type KioskSettingsPageProps = {
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

async function fetchKioskSettings(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('kiosk_settings')
    .select('is_enabled, pin_code')
    .eq('event_id', eventId)
    .single();

  // 설정이 없으면 기본값
  if (error || !data) {
    return {
      is_enabled: false,
      pin_code: null,
    };
  }

  return data;
}

export default async function KioskSettingsPage({ params }: KioskSettingsPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, kioskSettings] = await Promise.all([
    fetchEvent(eventId),
    fetchKioskSettings(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // KIOSK URL 생성
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const kioskUrl = `${siteUrl}/kiosk/${eventId}`;
  const kioskUrlWithPin = kioskSettings.pin_code
    ? `${kioskUrl}?pin=${kioskSettings.pin_code}`
    : kioskUrl;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">KIOSK 설정</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 셀프 체크인 KIOSK 모드를 관리하세요.
        </p>
      </div>
      <KioskSettingsClient
        eventId={eventId}
        initialSettings={kioskSettings}
        kioskUrl={kioskUrl}
        kioskUrlWithPin={kioskUrlWithPin}
      />
    </div>
  );
}

