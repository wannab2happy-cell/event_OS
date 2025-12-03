import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Users, CheckCircle2, Clock4, Plane, Hotel, Edit3 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant, ParticipantStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const statusMap: Record<
  ParticipantStatus,
  { label: string; color: string; icon: ReactNode }
> = {
  invited: {
    label: '초대됨',
    color: 'bg-gray-100 text-gray-600',
    icon: <Clock4 className="w-4 h-4 mr-1" />,
  },
  registered: {
    label: '정보 입력 중',
    color: 'bg-yellow-100 text-yellow-600',
    icon: <Clock4 className="w-4 h-4 mr-1" />,
  },
  completed: {
    label: '등록 완료',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
  },
  checked_in: {
    label: '현장 체크인',
    color: 'bg-blue-100 text-blue-700',
    icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
  },
};

type ParticipantListPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function ParticipantListPage({ params }: ParticipantListPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const { data: participants, error } = await supabaseAdmin
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin participant fetch error:', error);
    return (
      <div className="p-8 text-red-500">데이터 로드 오류: 관리자 권한 및 RLS 설정을 확인하세요.</div>
    );
  }

  if (!participants) {
    return notFound();
  }

  const participantList = participants as Participant[];

  const countByStatus = participantList.reduce(
    (acc, participant) => {
      acc[participant.status] = (acc[participant.status] ?? 0) + 1;
      return acc;
    },
    {
      invited: 0,
      registered: 0,
      completed: 0,
      checked_in: 0,
    } as Record<ParticipantStatus, number>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2" /> 참가자 관리
        </h1>
        <p className="text-sm text-gray-500">이벤트 참가자 목록 및 관리</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(statusMap) as ParticipantStatus[]).map((status) => {
          const statusInfo = statusMap[status];
          const count = countByStatus[status] ?? 0;
          return (
            <Card key={status}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">{statusInfo.label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className={`p-2 rounded-full ${statusInfo.color}`}>{statusInfo.icon}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 참가자 목록 ({participantList.length}명)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름 / 이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  소속 / 직책
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  확정
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantList.map((participant) => {
                const statusInfo = statusMap[participant.status] ?? statusMap.invited;

                return (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                      <div className="text-sm text-gray-500">{participant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.company ?? '-'}</div>
                      <div className="text-sm text-gray-500">{participant.position ?? '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        <span
                          className={`p-1 rounded-full ${
                            participant.is_travel_confirmed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title="항공 확정"
                        >
                          <Plane className="w-4 h-4 text-white" />
                        </span>
                        <span
                          className={`p-1 rounded-full ${
                            participant.is_hotel_confirmed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title="호텔 확정"
                        >
                          <Hotel className="w-4 h-4 text-white" />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/events/${eventId}/participants/${participant.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4 mr-1" />
                          관리
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

