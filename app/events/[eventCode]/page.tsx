import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CalendarDays, MapPin, User } from 'lucide-react';
import { notFound } from 'next/navigation';

type EventHomePageProps = {
  params: Promise<{ eventCode?: string }>;
};

export default async function EventHomePage({ params }: EventHomePageProps) {
  const resolvedParams = await params;
  const eventCode = resolvedParams?.eventCode;

  if (!eventCode) {
    return notFound();
  }

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, start_date, end_date, location_name, hero_tagline')
    .eq('code', eventCode)
    .single();

  if (error || !event) {
    return notFound();
  }

  const basePath = `/events/${eventCode}`;

  return (
    <div className="space-y-6">
      {/* Tagline */}
      <section className="bg-white rounded-2xl shadow-sm border px-5 py-4">
        <p className="text-xs text-sky-600 font-semibold mb-1 uppercase tracking-wide">Welcome</p>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          {event.hero_tagline ?? '행사에 오신 것을 환영합니다.'}
        </h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          행사 일정, 내 좌석, 장소 안내를 이 페이지에서 모두 확인할 수 있습니다.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`${basePath}/my-table`}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-emerald-100 mb-1 uppercase tracking-wide">My Table</p>
            <h3 className="text-base md:text-lg font-semibold">내 테이블 확인</h3>
            <p className="text-xs text-emerald-100 mt-1 opacity-90">
              배정된 테이블 번호와 좌석 정보를 확인하세요.
            </p>
          </div>
          <User className="w-7 h-7 opacity-90 group-hover:scale-110 transition-transform" />
        </Link>

        <Link
          href={`${basePath}/schedule`}
          className="bg-white border rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-sky-600 mb-1 uppercase tracking-wide font-semibold">
              Program
            </p>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">전체 일정 보기</h3>
            <p className="text-xs text-gray-500 mt-1">
              세션 시간과 내용을 한눈에 확인합니다.
            </p>
          </div>
          <CalendarDays className="w-7 h-7 text-sky-500 group-hover:scale-110 transition-transform" />
        </Link>
      </section>

      {/* Venue CTA */}
      <section className="bg-white rounded-2xl shadow-sm border px-5 py-4 flex items-start gap-3 hover:shadow-md transition">
        <div className="shrink-0">
          <MapPin className="w-7 h-7 text-rose-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">장소 안내</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
            호텔 위치, 층별 안내, 이동 동선을 미리 확인해 주세요.
          </p>
          <Link
            href={`${basePath}/venue`}
            className="inline-flex items-center gap-1 text-xs md:text-sm text-sky-600 font-semibold mt-2 hover:text-sky-700 transition"
          >
            장소 상세 보기 →
          </Link>
        </div>
      </section>
    </div>
  );
}

