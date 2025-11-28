export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { assertAdminAuth } from '@/lib/auth';

async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, code, start_date, end_date, location_name, status')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Events fetch error:', error);
    return [];
  }

  return data;
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getStatusBadge(status: string) {
  const statusMap = {
    planning: { label: '기획 중', className: 'bg-amber-50 text-amber-700' },
    active: { label: '진행 중', className: 'bg-blue-50 text-blue-700' },
    archived: { label: '종료', className: 'bg-gray-50 text-gray-700' },
  };

  const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.planning;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}

export default async function EventsPage() {
  await assertAdminAuth();

  const events = await fetchEvents();

  // 이벤트가 없으면 대시보드로 리다이렉트 (또는 첫 이벤트 생성 유도)
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">이벤트 관리</h1>
            <p className="text-sm text-gray-500 mt-1">생성된 이벤트를 관리하고 참가자를 초대하세요.</p>
          </div>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <p className="text-gray-600">아직 생성된 이벤트가 없습니다.</p>
              <Button variant="primary" size="lg" asChild>
                <Link href="/admin/events/new">새 이벤트 만들기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">이벤트 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {events.length}개의 이벤트가 등록되어 있습니다.
          </p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/admin/events/new">새 이벤트 만들기</Link>
        </Button>
      </div>

      {/* 이벤트 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-gray-500">
                    {event.code}
                  </CardDescription>
                </div>
                {getStatusBadge(event.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 이벤트 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatDate(event.start_date)}
                    {event.end_date && event.start_date !== event.end_date && (
                      <> ~ {formatDate(event.end_date)}</>
                    )}
                  </span>
                </div>
                {event.location_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{event.location_name}</span>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  href={`/admin/events/${event.id}/participants`}
                  className="block w-full"
                >
                  <Button variant="primary" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    참가자 관리
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/events/${event.id}/branding`} className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      브랜딩
                    </Button>
                  </Link>
                  <Link href={`/admin/events/${event.id}/mail`} className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      메일
                    </Button>
                  </Link>
                </div>
                <Link href={`/admin/events/${event.id}/clone`} className="block mt-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    이 이벤트 복제하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

