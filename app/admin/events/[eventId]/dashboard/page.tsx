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
<<<<<<< HEAD
    <div className="space-y-8">
      {/* Page Header - Stripe Style */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{eventTitle}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {dateRange && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{dateRange}</span>
            </div>
          )}
          {location_name && (
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>{location_name}</span>
            </div>
          )}
=======
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
>>>>>>> b60f667bd1493d761b285483faff1b321ff40f8e
        </div>

<<<<<<< HEAD
      {/* Metrics Grid - Stripe Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Participants */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 참가자</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
            <p className="text-xs text-gray-500 mt-2">전체 초대 명단</p>
          </CardContent>
        </Card>

        {/* Registered */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">등록 완료</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.registered}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">{registrationRate}%</span>
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Checked In */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">체크인 완료</CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.checkedIn}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">{checkInRate}%</span>
              <TrendingUp className="h-3 w-3 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">정보 완성도</CardTitle>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <BarChart className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
            <p className="text-xs text-gray-500 mt-2">{metrics.completed}명 완료</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Stripe Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Participants - Left Column (2/3) */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">최근 등록 참가자</CardTitle>
                  <CardDescription className="mt-1">가장 최근에 등록하거나 정보를 업데이트한 참가자</CardDescription>
                </div>
                <Link
                  href={`/admin/events/${eventId}/participants`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  전체 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
=======
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
>>>>>>> b60f667bd1493d761b285483faff1b321ff40f8e
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
<<<<<<< HEAD
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-base font-semibold text-gray-900">빠른 작업</CardTitle>
              <CardDescription className="mt-1">자주 사용하는 기능</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link
                href={`/admin/events/${eventId}/participants`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">참가자 관리</div>
                  <div className="text-xs text-gray-500">참가자 목록 및 편집</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                href={`/admin/events/${eventId}/tables`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Table className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">테이블 배정</div>
                  <div className="text-xs text-gray-500">좌석 배정 및 관리</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link
                href={`/admin/events/${eventId}/mail`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Mail className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">메일 센터</div>
                  <div className="text-xs text-gray-500">이메일 발송 및 템플릿</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </CardContent>
          </Card>

          {/* Event Status Card */}
          <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-base font-semibold text-gray-900">이벤트 상태</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">등록률</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${registrationRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{registrationRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">체크인률</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${checkInRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{checkInRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">완성도</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{completionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
=======
            </tbody>
          </table>
>>>>>>> b60f667bd1493d761b285483faff1b321ff40f8e
        </div>
      </div>
    </div>
  );
}
