import { createClient } from '@/lib/supabase/server';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { notFound } from 'next/navigation';

type VenuePageProps = {
  params: Promise<{ eventCode?: string }>;
};

export default async function VenuePage({ params }: VenuePageProps) {
  const resolvedParams = await params;
  const eventCode = resolvedParams?.eventCode;

  if (!eventCode) {
    return notFound();
  }

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('location_name, location_detail, venue_map_url')
    .eq('code', eventCode)
    .single();

  if (error || !event) {
    return notFound();
  }

  return (
    <div className="space-y-5">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">장소 안내</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          행사 장소 및 이동 동선을 확인하세요.
        </p>
      </div>

      {/* Main Venue Info */}
      <section className="bg-white rounded-2xl shadow-sm border px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 rounded-lg">
            <MapPin className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-sm md:text-base font-semibold text-gray-900">
            {event.location_name || '장소 정보'}
          </p>
        </div>

        {event.location_detail && (
          <div className="mt-3">
            <p className="text-xs md:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {event.location_detail}
            </p>
          </div>
        )}

        {event.venue_map_url && (
          <a
            href={event.venue_map_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-sky-600 font-semibold mt-3 hover:text-sky-700 transition"
          >
            <Navigation className="w-4 h-4" />
            지도에서 열기
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      {/* Venue Details / Directions */}
      <section className="bg-white rounded-2xl shadow-sm border px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <Navigation className="w-5 h-5 text-sky-600" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-gray-900">현장 동선 안내</h3>
        </div>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
          등록 데스크 위치, 메인 세션 룸, Breakout 룸, 휴게 공간, 화장실 등 세부 동선 정보는
          행사 직전 업데이트될 수 있습니다.
        </p>
      </section>

      {/* Additional Info Placeholder */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">참고사항</h3>
        <ul className="text-xs md:text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>행사 당일 현장에서 최종 안내를 받으실 수 있습니다.</li>
          <li>주차 정보는 행사 전 안내 메일을 확인해주세요.</li>
          <li>문의사항이 있으시면 행사 운영팀으로 연락주세요.</li>
        </ul>
      </section>
    </div>
  );
}

