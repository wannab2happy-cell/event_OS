import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface ParticipantPageProps {
  params: { eventId: string };
}

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const { eventId } = params;

  const { data: event } = await supabase
    .from('events')
    .select('*, event_branding(*)')
    .eq('id', eventId)
    .single();

  if (!event) {
    return notFound();
  }

  const branding = (event.event_branding as Array<Record<string, any>>)?.[0] || {};
  const logoUrl = branding.logo_url;
  const kvUrl = branding.kv_image_url;

  return (
    <main className="w-full">
      <section className="relative w-full h-[60vh] md:h-[500px] overflow-hidden bg-gray-900 text-white">
        {kvUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${kvUrl})` }}
          />
        )}

        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-between py-12">
          <div className="flex justify-between items-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <h1 className="text-2xl font-bold tracking-tighter">{event.title}</h1>
            )}
            <nav className="hidden md:flex gap-6 text-sm font-medium tracking-wide">
              <a href="#about" className="hover:text-[var(--primary)] transition">
                ABOUT
              </a>
              <a href="#schedule" className="hover:text-[var(--primary)] transition">
                SCHEDULE
              </a>
              <a href="#venue" className="hover:text-[var(--primary)] transition">
                VENUE
              </a>
            </nav>
          </div>

          <div className="max-w-3xl">
            <p className="text-[var(--primary)] font-bold mb-2 uppercase tracking-widest">
              {event.code}
            </p>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {event.hero_tagline || event.title}
            </h2>
            <div className="flex flex-col md:flex-row gap-4 text-sm md:text-base opacity-90">
              <span>
                📅 {event.start_date} ~ {event.end_date}
              </span>
              <span className="hidden md:inline">|</span>
              <span>📍 {event.location_name}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--primary)]/5 border-b border-[var(--primary)]/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">참가자 정보를 등록해주세요</h3>
            <p className="text-gray-600 text-sm">항공, 호텔, 식단 정보를 입력해야 등록이 완료됩니다.</p>
          </div>
          <Link
            href={`/${eventId}/register`}
            className="px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition transform hover:-translate-y-0.5"
          >
            등록 정보 입력하기 &rarr;
          </Link>
        </div>
      </section>

      <section id="about" className="py-20 container mx-auto px-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">About Event</h3>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          {event.location_detail || '행사 상세 내용이 곧 업데이트 됩니다.'}
        </p>
      </section>
    </main>
  );
}

