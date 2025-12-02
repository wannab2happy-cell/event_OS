import { supabase } from '@/lib/supabaseClient';
import { assertAdminAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, CheckSquare, Home, BarChart } from 'lucide-react';

async function fetchRecentParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('event_participants')
    .select('id, name, email, company, status')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) return [];
  return data;
}

export default async function AdminEventDashboardPage({ params }: { params: Promise<{ eventId: string }> }) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams.eventId;

  const { data: eventData } = await supabase.from('events').select('id, title, code').eq('id', eventId).single();

  if (!eventData) redirect('/admin/events');

  const { title: eventTitle } = eventData;

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

  const metrics = {
    total: total.count || 0,
    registered: registered.count || 0,
    checkedIn: checkedIn.count || 0,
    completed: completed.count || 0,
  };

  const metricCards = [
    { title: '총 초대 참가자', value: metrics.total, icon: Users },
    { title: '등록 완료', value: metrics.registered, icon: CheckSquare },
    { title: '현장 체크인', value: metrics.checkedIn, icon: Home },
    {
      title: '정보 완성도',
      value: `${Math.round((metrics.completed / (metrics.total || 1)) * 100)}%`,
      icon: BarChart,
    },
  ];

  const recentParticipants = await fetchRecentParticipants(eventId);

  return (
    <div className="space-y-8 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{eventTitle}</h1>
        <p className="text-gray-500">이벤트 대시보드 요약</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <card.icon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Participants */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold">최근 등록 참가자</h2>
          <p className="text-sm text-gray-500">최근 5명 참가자 활동</p>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">이름</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">회사</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">이메일</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">상태</th>
              </tr>
            </thead>
            <tbody>
              {recentParticipants.length > 0 ? (
                recentParticipants.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-900">{p.name || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{p.company || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{p.email || '-'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'registered'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.status === 'completed' ? '완료' : p.status === 'registered' ? '등록 중' : '초대됨'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    등록된 참가자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
