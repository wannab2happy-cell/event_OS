import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  event: {
    id: string;
    title: string;
    code: string;
    hero_tagline?: string | null;
    start_date: string;
    end_date: string;
    location_name?: string | null;
  };
  branding: {
    logo_url?: string | null;
    kv_image_url?: string | null;
  };
}

export default function HeroSection({ event, branding }: HeroSectionProps) {
  const logoUrl = branding.logo_url;
  const kvUrl = branding.kv_image_url;

  return (
    <section id="overview" className="relative w-full min-h-[60vh] md:min-h-[500px] overflow-hidden bg-gray-900 text-white">
      {kvUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${kvUrl})` }}
        />
      )}

      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[50vh]">
          {/* 왼쪽: 메인 콘텐츠 */}
          <div className="space-y-6">
            {logoUrl && (
              <div className="mb-4">
                <Image
                  src={logoUrl}
                  alt="Event Logo"
                  width={160}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            )}
            
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-widest">
              {event.code}
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {event.hero_tagline || event.title}
            </h1>
            
            <div className="flex flex-col gap-2 text-sm md:text-base opacity-90">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span>
                  {event.start_date} ~ {event.end_date}
                </span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <span>{event.location_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 정보 카드 */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-3">
                  Event Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Date</p>
                    <p className="text-base font-medium leading-relaxed">
                      {event.start_date === event.end_date
                        ? event.start_date
                        : `${event.start_date} - ${event.end_date}`}
                    </p>
                  </div>
                  {event.location_name && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Venue</p>
                      <p className="text-base font-medium leading-relaxed">{event.location_name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 space-y-3">
                <Link
                  href={`/${event.id}/login`}
                  className="block w-full px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg text-center hover:opacity-90 transition transform hover:-translate-y-0.5 shadow-lg"
                >
                  Register Now &rarr;
                </Link>
                <Link
                  href={`/${event.id}/qr-pass`}
                  className="block w-full px-6 py-3 bg-white/10 text-white font-medium rounded-lg text-center hover:bg-white/20 transition border border-white/20"
                >
                  View QR Pass
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

