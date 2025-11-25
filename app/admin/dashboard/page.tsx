import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Home, Users, CheckSquare, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { assertAdminAuth } from '@/lib/auth';
import { Participant } from '@/lib/types';

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

export default async function AdminDashboardPage() {
  await assertAdminAuth();

  const { data: eventData } = await supabase.from('events').select('id, title, code').limit(1).single();

  if (!eventData) {
    redirect('/admin/events');
  }

  const { id: eventId, title: eventTitle } = eventData;
  const metrics = await fetchDashboardData(eventId);
  const recentParticipants = await fetchRecentParticipants(eventId);

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
    </div>
  );
}

