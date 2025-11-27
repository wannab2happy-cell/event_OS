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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{eventTitle} 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 등록 참가자</CardTitle>
          <CardDescription>가장 최근에 초대되거나 정보를 입력한 참가자 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회사</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentParticipants.length > 0 ? (
                  recentParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.company || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'registered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {p.status === 'completed' ? '정보 완성' : p.status === 'registered' ? '등록 중' : '초대됨'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      등록된 참가자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 text-right">
            <Link href={`/admin/events/${eventId}/participants`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              전체 참가자 보기 &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
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
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>
                    <span className="inline-flex h-6 items-center rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700">
                      {formatNotificationLabel(notification.type)}
                    </span>
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
  );
}

