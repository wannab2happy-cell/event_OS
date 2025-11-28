export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import KioskShell from '@/components/kiosk/KioskShell';

type KioskPageProps = {
  params: Promise<{ eventId?: string }>;
  searchParams?: Promise<{ pin?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code, primary_color')
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

  // 설정이 없으면 기본값 (비활성화)
  if (error || !data) {
    return {
      is_enabled: false,
      pin_code: null,
    };
  }

  return data;
}

export default async function KioskPage({ params, searchParams }: KioskPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const resolvedSearch = searchParams ? await searchParams : {};
  const pin = resolvedSearch?.pin;

  const [event, kioskSettings] = await Promise.all([
    fetchEvent(eventId),
    fetchKioskSettings(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // PIN 체크 (PIN이 설정되어 있고, URL에 PIN이 없거나 틀린 경우)
  if (kioskSettings.pin_code && kioskSettings.pin_code.trim() !== '') {
    if (!pin || pin !== kioskSettings.pin_code) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">KIOSK 접근</h1>
            <p className="text-lg text-gray-600 mb-6">
              이 KIOSK는 PIN 코드로 보호되어 있습니다.
            </p>
            <p className="text-sm text-gray-500">
              올바른 PIN 코드를 포함한 URL로 접근해주세요.
            </p>
          </div>
        </div>
      );
    }
  }

  // KIOSK 비활성화 상태
  if (!kioskSettings.is_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">KIOSK 모드</h1>
          <p className="text-lg text-gray-600">
            이 이벤트는 아직 KIOSK 모드가 활성화되지 않았습니다.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  // KIOSK 활성화 상태 - KioskShell 렌더링
  return <KioskShell event={event} eventId={eventId} />;
}

