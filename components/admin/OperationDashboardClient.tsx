'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  Crown,
  Bell,
  RefreshCw,
  Clock,
  QrCode,
  Megaphone,
  Table,
  UserPlus,
  Info,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OperationsStats {
  totalParticipants: number;
  completed: number;
  checkedIn: number;
  vipCheckedIn: number;
  pushSubscribers: number;
  todayUpdates: number;
}

interface OperationLog {
  id: string;
  type: string;
  message: string;
  actor: string | null;
  createdAt: string;
  metadata?: any;
  participant?: {
    id: string;
    name: string;
    email: string;
    vipLevel: number;
  };
}

interface OperationDashboardClientProps {
  eventId: string;
  stats: OperationsStats;
  logs: OperationLog[];
}

export default function OperationDashboardClient({
  eventId,
  stats: initialStats,
  logs: initialLogs,
}: OperationDashboardClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [logs, setLogs] = useState(initialLogs);

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setStats(initialStats);
    setLogs(initialLogs);
  }, [initialStats, initialLogs]);

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

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'checkin':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'vip_update':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'info_update':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'broadcast':
        return <Megaphone className="h-4 w-4 text-violet-500" />;
      case 'subscription':
        return <Bell className="h-4 w-4 text-gray-500" />;
      default:
        return <Radio className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLogColor = (type: string, isVip: boolean = false) => {
    if (isVip) return 'bg-amber-50 border-amber-200';
    
    switch (type) {
      case 'checkin':
        return 'bg-emerald-50 border-emerald-200';
      case 'vip_update':
        return 'bg-amber-50 border-amber-200';
      case 'participant_update':
        return 'bg-blue-50 border-blue-200';
      case 'info_update':
        return 'bg-blue-50 border-blue-200';
      case 'broadcast':
        return 'bg-violet-50 border-violet-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
          <h2 className="text-lg font-semibold text-gray-900">실시간 운영 현황</h2>
          <p className="text-xs text-gray-500 mt-1">
            자동 새로고침: 10초 주기
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
                <p className="text-xs text-gray-500 mb-1">등록 완료</p>
                <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">체크인 완료</p>
                <p className="text-xl font-semibold text-gray-900">{stats.checkedIn}</p>
                <p className="text-xs text-gray-500 mt-1">{checkinRate}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-emerald-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">VIP 체크인</p>
                <p className="text-xl font-semibold text-gray-900">{stats.vipCheckedIn}</p>
              </div>
              <Crown className="h-6 w-6 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Push 구독자</p>
                <p className="text-xl font-semibold text-gray-900">{stats.pushSubscribers}</p>
              </div>
              <Bell className="h-6 w-6 text-violet-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">오늘 업데이트</p>
                <p className="text-xl font-semibold text-gray-900">{stats.todayUpdates}</p>
              </div>
              <RefreshCw className="h-6 w-6 text-gray-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="border border-gray-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/admin/events/${eventId}/scanner`} className="block">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                빠른 체크인하기
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/vip`} className="block">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Crown className="h-4 w-4 mr-2" />
                VIP 목록 열기
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/broadcast`} className="block">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Megaphone className="h-4 w-4 mr-2" />
                Broadcast Push 보내기
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/tables`} className="block">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <Table className="h-4 w-4 mr-2" />
                테이블 배정 페이지
              </Button>
            </Link>
            <Link href={`/admin/events/${eventId}/participants`} className="block">
              <Button variant="secondary" className="w-full justify-start" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                참가자 등록 페이지
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Real-time Logs Feed */}
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">실시간 알림 스트림</CardTitle>
            <CardDescription>최근 100건의 운영 로그를 확인할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">아직 운영 로그가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.map((log) => {
                  const isVip = log.participant?.vipLevel > 0;
                  return (
                      <Link
                        key={log.id}
                        href={
                          log.type === 'participant_update' && log.metadata?.participant_id
                            ? `/admin/events/${eventId}/updates`
                            : '#'
                        }
                        className={`block p-3 rounded-lg border ${getLogColor(log.type, isVip)} transition-colors hover:shadow-sm ${
                          log.type === 'participant_update' ? 'cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getLogIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isVip && (
                                <Crown className="h-3 w-3 text-amber-500 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {log.message}
                              </span>
                              {log.type === 'participant_update' && (
                                <span className="text-xs text-blue-600">→ 상세 보기</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(log.createdAt)}
                              </div>
                              {log.actor && (
                                <div className="flex items-center gap-1">
                                  <span>by {log.actor}</span>
                                </div>
                              )}
                              {log.participant && (
                                <div className="text-xs text-gray-600 truncate">
                                  {log.participant.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

