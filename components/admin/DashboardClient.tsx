'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, Crown, RefreshCw, Clock, Mail, Building, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  vipCheckedIn: number;
  todayUpdates?: number;
}

interface CheckinLog {
  id: string;
  createdAt: string;
  isDuplicate: boolean;
  scannedBy: string | null;
  participant: {
    id: string;
    name: string;
    email: string;
    vipLevel: number;
    company: string | null;
  };
}

interface HourlyData {
  hour: string;
  count: number;
}

interface DashboardClientProps {
  eventId: string;
  stats: DashboardStats;
  recentCheckins: CheckinLog[];
  hourlyData: HourlyData[];
}

export default function DashboardClient({
  eventId,
  stats: initialStats,
  recentCheckins: initialCheckins,
  hourlyData: initialHourlyData,
}: DashboardClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [recentCheckins, setRecentCheckins] = useState(initialCheckins);
  const [hourlyData, setHourlyData] = useState(initialHourlyData);

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setStats(initialStats);
    setRecentCheckins(initialCheckins);
    setHourlyData(initialHourlyData);
  }, [initialStats, initialCheckins, initialHourlyData]);

  // 자동 새로고침 (5초 주기)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // 페이지 새로고침으로 최신 데이터 가져오기
      router.refresh();
      // 상태는 서버 컴포넌트에서 다시 로드되므로, 잠시 후 상태 업데이트
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

  const checkinRate = stats.totalParticipants > 0 
    ? ((stats.checkedIn / stats.totalParticipants) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* 헤더 및 새로고침 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">실시간 체크인 현황</h2>
          <p className="text-xs text-gray-500 mt-1">
            자동 새로고침: 5초 주기
            {stats.todayUpdates !== undefined && stats.todayUpdates > 0 && (
              <span className="ml-2 text-blue-600">
                • 오늘 정보 변경 {stats.todayUpdates}건
              </span>
            )}
          </p>
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

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 참가자</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalParticipants}</p>
                <p className="text-xs text-gray-500 mt-1">체크인률: {checkinRate}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">체크인 완료</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.checkedIn}</p>
                <p className="text-xs text-gray-500 mt-1">
                  미체크인: {stats.totalParticipants - stats.checkedIn}명
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">VIP 체크인</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.vipCheckedIn}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  VIP 전용
                </p>
              </div>
              <Crown className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시간대별 체크인 그래프 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">시간대별 체크인 현황</CardTitle>
          <CardDescription>오늘 시간대별 체크인 통계입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '시간', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: '체크인 수', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}명`, '체크인']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="체크인 수"
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>아직 체크인 데이터가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 체크인 로그 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">최근 체크인 로그</CardTitle>
          <CardDescription>최근 50건의 체크인 기록을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCheckins.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">아직 체크인 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      참가자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      스캔 담당
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCheckins.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gray-50 ${
                        log.participant.vipLevel > 0 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {log.participant.vipLevel > 0 && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {log.participant.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {log.participant.email}
                            </div>
                            {log.participant.company && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Building className="h-3 w-3" />
                                {log.participant.company}
                              </div>
                            )}
                            {log.participant.vipLevel > 0 && (
                              <div className="text-xs text-amber-600 font-medium mt-1">
                                VIP Level {log.participant.vipLevel}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            중복
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            체크인
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.scannedBy || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

