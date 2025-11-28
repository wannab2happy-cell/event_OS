export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Home, Users, CheckSquare, BarChart, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import { Participant, AdminNotification } from '@/lib/types';

async function fetchDashboardData(eventId: string) {
  const [total, registered, checkedIn, completed] = await Promise.all([
    supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
    supabase
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered'),
    supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
    supabase
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'completed'),
  ]);

  return {
    total: total.count || 0,
    registered: registered.count || 0,
    checkedIn: checkedIn.count || 0,
    completed: completed.count || 0,
  };
}

async function fetchRecentParticipants(eventId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) return [];
  return data as Participant[];
}

async function fetchAdminNotifications(eventId: string): Promise<AdminNotification[]> {
  const { data, error } = await supabaseAdmin
    .from('admin_notifications')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) {
    console.error('Admin notifications fetch error:', error);
    return [];
  }

  return data as AdminNotification[];
}

function formatNotificationLabel(type: string) {
  switch (type) {
    case 'travel_updated':
      return '항공 정보';
    case 'hotel_completed':
      return '호텔 정보';
    default:
      return '알림';
  }
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function AdminDashboardPage() {
  await assertAdminAuth();

  const { data: eventData } = await supabase.from('events').select('id, title, code').limit(1).single();

  if (!eventData) {
    redirect('/admin/events');
  }

  const { id: eventId, title: eventTitle } = eventData;
  const [metrics, recentParticipants, notifications] = await Promise.all([
    fetchDashboardData(eventId),
    fetchRecentParticipants(eventId),
    fetchAdminNotifications(eventId),
  ]);

  const metricCards = [
    { title: '총 초대 참가자 수', icon: Users, value: metrics.total, description: '전체 명단 기준' },
    { title: '등록 완료 수', icon: CheckSquare, value: metrics.registered, description: '필수 정보 입력 완료' },
    { title: '현장 체크인 수', icon: Home, value: metrics.checkedIn, description: 'QR 스캔 완료' },
    {
      title: '정보 완성도',
      icon: BarChart,
      value: `${Math.round((metrics.completed / (metrics.total || 1)) * 100)}%`,
      description: 'Completed / Total',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero / Summary */}
      <section className="rounded-3xl border border-gray-100 bg-gradient-to-r from-blue-50 via-slate-50 to-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-500">Event Overview</p>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">{eventTitle}</h1>
            <p className="text-sm text-gray-600">
              핵심 KPI와 참가자 현황을 한 눈에 확인하고, 필요한 액션을 바로 수행하세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-gray-600 lg:text-right">
            <span className="font-semibold text-gray-900">이벤트 ID</span>
            <span className="rounded-full bg-white px-4 py-2 font-mono text-sm text-gray-700 shadow-sm">
              {eventId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => (
          <Card
            key={index}
            className="border border-gray-100 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
              <span className="rounded-full bg-gray-100 p-2 text-gray-600">
                <card.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">최근 등록 참가자</CardTitle>
              <CardDescription>가장 최근에 초대되거나 정보를 입력한 참가자 목록입니다.</CardDescription>
            </div>
            <Link
              href={`/admin/events/${eventId}/participants`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              전체 참가자 보기 &rarr;
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3">회사</th>
                    <th className="px-4 py-3">이메일</th>
                    <th className="px-4 py-3 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentParticipants.length ? (
                    recentParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.company || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{p.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              p.status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : p.status === 'registered'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {p.status === 'completed' ? '정보 완성' : p.status === 'registered' ? '등록 중' : '초대됨'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                        등록된 참가자가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Bell className="w-4 h-4 mr-2 text-blue-600" />
              최근 알림
            </CardTitle>
            <CardDescription>참가자 정보 변경 내역이 자동으로 기록됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length ? (
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {formatNotificationLabel(notification.type)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDateTime(notification.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">새로운 알림이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

