'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, XCircle, Crown, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  unCheckedIn: number;
  vipCheckedIn: number;
}

interface RecentCheckin {
  id: string;
  createdAt: string;
  isDuplicate: boolean;
  participant: {
    id: string;
    name: string;
    email: string;
    vip_level: number | null;
  } | null;
}

interface StaffLiveLiteClientProps {
  eventId: string;
  stats: DashboardStats;
  recentCheckins: RecentCheckin[];
}

export default function StaffLiveLiteClient({
  eventId,
  stats: initialStats,
  recentCheckins: initialRecentCheckins,
}: StaffLiveLiteClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [recentCheckins, setRecentCheckins] = useState(initialRecentCheckins);

  // 자동 새로고침 (10초 주기)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Refresh error:', error);
      setIsRefreshing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 새로고침 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">실시간 현황</h2>
          <p className="text-xs text-gray-500 mt-1">자동 새로고침: 10초 주기</p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">총 참가자</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalParticipants}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">체크인 완료</p>
                <p className="text-xl font-semibold text-emerald-600">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">미체크인</p>
                <p className="text-xl font-semibold text-gray-600">{stats.unCheckedIn}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">VIP 체크인</p>
                <p className="text-xl font-semibold text-amber-600">{stats.vipCheckedIn}</p>
              </div>
              <Crown className="h-6 w-6 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 체크인 리스트 */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">최근 체크인 (최대 20건)</h3>
          </div>
          <div className="overflow-x-auto">
            {recentCheckins.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">아직 체크인 기록이 없습니다.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      참가자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCheckins.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.participant ? (
                          <div className="flex items-center gap-2">
                            {log.participant.vip_level && log.participant.vip_level > 0 && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{log.participant.name}</div>
                              <div className="text-xs text-gray-500">{log.participant.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">알 수 없음</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {log.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                            중복
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            체크인
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

