import React from 'react';
import Link from 'next/link';
import { CalendarDays, Home, MapPin, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type EventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventCode?: string }>;
};

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const resolvedParams = await params;
  const eventCode = resolvedParams?.eventCode;

  if (!eventCode) {
    return notFound();
  }

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, start_date, end_date, location_name')
    .eq('code', eventCode)
    .single();

  if (error || !event) {
    return notFound();
  }

  // Format date range
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const dateRange =
    event.start_date === event.end_date
      ? formatDate(event.start_date)
      : `${formatDate(event.start_date)} ~ ${formatDate(event.end_date)}`;

  const location = event.location_name ?? '';
  const basePath = `/events/${eventCode}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top header */}
      <header className="bg-gradient-to-r from-sky-600 to-sky-700 text-white">
        <div className="max-w-[720px] mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold truncate">{event.title}</h1>
          <p className="text-xs text-sky-100 mt-1">{dateRange}</p>
          {location && (
            <div className="flex items-center gap-1 text-xs text-sky-100 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 md:pb-4">
        <div className="max-w-[720px] mx-auto w-full px-4 py-4">{children}</div>
      </main>

      {/* Bottom nav (mobile first) */}
      <nav className="border-t bg-white sticky bottom-0 z-10 md:relative md:border-0 md:bg-transparent">
        <div className="max-w-[720px] mx-auto flex justify-between px-4 py-2 text-xs md:justify-start md:gap-6 md:py-4">
          <Link
            href={basePath}
            className="flex flex-col items-center flex-1 md:flex-row md:gap-2 md:flex-initial hover:text-sky-600 transition"
          >
            <Home className="w-5 h-5" />
            <span>홈</span>
          </Link>
          <Link
            href={`${basePath}/schedule`}
            className="flex flex-col items-center flex-1 md:flex-row md:gap-2 md:flex-initial hover:text-sky-600 transition"
          >
            <CalendarDays className="w-5 h-5" />
            <span>일정</span>
          </Link>
          <Link
            href={`${basePath}/venue`}
            className="flex flex-col items-center flex-1 md:flex-row md:gap-2 md:flex-initial hover:text-sky-600 transition"
          >
            <MapPin className="w-5 h-5" />
            <span>장소</span>
          </Link>
          <Link
            href={`${basePath}/my-table`}
            className="flex flex-col items-center flex-1 md:flex-row md:gap-2 md:flex-initial hover:text-sky-600 transition"
          >
            <User className="w-5 h-5" />
            <span>내 테이블</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

