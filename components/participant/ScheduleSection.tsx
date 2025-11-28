import type { ScheduleItem } from '@/lib/types';

interface ScheduleSectionProps {
  event: {
    title: string;
    start_date: string;
    end_date: string;
    schedule?: ScheduleItem[] | null;
  };
}

export default function ScheduleSection({ event }: ScheduleSectionProps) {
  const schedule = event.schedule || null;

  return (
    <section id="schedule" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 items-start">
          {/* 왼쪽: 제목 및 설명 */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Schedule
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              행사 일정을 확인하고 중요한 세션을 놓치지 마세요.
            </p>
          </div>

          {/* 오른쪽: 타임라인 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            {schedule && schedule.length > 0 ? (
              <div className="space-y-6">
                {schedule.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[80px_1fr] gap-4 md:gap-6 items-start pb-6 last:pb-0 border-b border-gray-100 last:border-0"
                  >
                    {/* 시간 */}
                    <div className="pt-1">
                      <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    {/* 세션 정보 */}
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-lg font-medium text-gray-900 mb-2">Schedule Coming Soon</p>
                <p className="text-sm text-gray-500">
                  상세 일정이 곧 업데이트될 예정입니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

