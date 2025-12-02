import { createClient } from '@/lib/supabase/server';
import { Clock, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

type SchedulePageProps = {
  params: Promise<{ eventCode?: string }>;
};

export default async function SchedulePage({ params }: SchedulePageProps) {
  const resolvedParams = await params;
  const eventCode = resolvedParams?.eventCode;

  if (!eventCode) {
    return notFound();
  }

  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title')
    .eq('code', eventCode)
    .single();

  if (eventError || !event) {
    return notFound();
  }

  // Fetch sessions - adjust field names based on actual schema
  const { data: sessions, error: sessionsError } = await supabase
    .from('event_sessions')
    .select('id, title, start_time, end_time, location_name, description')
    .eq('event_id', event.id)
    .order('start_time', { ascending: true });

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">행사 일정</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          전체 세션 일정을 확인하세요.
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm px-5 py-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">등록된 일정이 없습니다.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {sessions.map((session, index) => {
            const startTime = formatTime(session.start_time);
            const endTime = formatTime(session.end_time);
            const date = formatDate(session.start_time);

            return (
              <li
                key={session.id}
                className="bg-white rounded-2xl border shadow-sm px-4 md:px-5 py-4 flex items-start gap-3 hover:shadow-md transition"
              >
                <div className="mt-1 shrink-0">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {index === 0 && date && (
                    <p className="text-xs text-sky-600 font-semibold mb-2">{date}</p>
                  )}
                  {index > 0 && formatDate(sessions[index - 1].start_time) !== date && date && (
                    <p className="text-xs text-sky-600 font-semibold mb-2 mt-3">{date}</p>
                  )}
                  <p className="text-xs text-gray-500 font-medium">
                    {startTime} ~ {endTime}
                  </p>
                  <p className="text-sm md:text-base font-semibold text-gray-900 mt-1">
                    {session.title}
                  </p>
                  {session.description && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                  {session.location_name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{session.location_name}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

