'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RefreshCw,
  Clock,
  Calendar,
  TrendingUp,
  Info,
  Search,
  Filter,
  User,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface UpdateLog {
  id: string;
  type: string;
  message: string;
  actor: string | null;
  createdAt: string;
  metadata?: {
    participant_id?: string;
    changes?: Array<{
      field: string;
      before: any;
      after: any;
    }>;
    participant_name?: string;
    participant_email?: string;
  };
  participant?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface UpdateStats {
  todayUpdates: number;
  last7DaysUpdates: number;
  topFields: string[];
}

interface UpdatesDashboardClientProps {
  eventId: string;
  logs: UpdateLog[];
  stats: UpdateStats;
}

export default function UpdatesDashboardClient({
  eventId,
  logs: initialLogs,
  stats: initialStats,
}: UpdatesDashboardClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [stats, setStats] = useState(initialStats);
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'all'>('all');
  const [fieldSearch, setFieldSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setLogs(initialLogs);
    setStats(initialStats);
  }, [initialLogs, initialStats]);

  // 자동 새로고침 (15초 주기)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 15000);

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
        year: 'numeric',
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

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // 날짜 필터
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((log) => new Date(log.createdAt) >= today);
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      filtered = filtered.filter((log) => new Date(log.createdAt) >= sevenDaysAgo);
    }

    // 필드명 검색
    if (fieldSearch.trim()) {
      const searchLower = fieldSearch.toLowerCase();
      filtered = filtered.filter((log) => {
        const changes = log.metadata?.changes || [];
        return changes.some((change: any) =>
          change.field?.toLowerCase().includes(searchLower)
        );
      });
    }

    // 참가자 이름/이메일 검색
    if (participantSearch.trim()) {
      const searchLower = participantSearch.toLowerCase();
      filtered = filtered.filter((log) => {
        const participant = log.participant || {
          name: log.metadata?.participant_name || '',
          email: log.metadata?.participant_email || '',
        };
        return (
          participant.name?.toLowerCase().includes(searchLower) ||
          participant.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [logs, dateFilter, fieldSearch, participantSearch]);

  return (
    <div className="space-y-6">
      {/* 헤더 및 새로고침 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">정보 변경 이력</h2>
          <p className="text-xs text-gray-500 mt-1">
            자동 새로고침: 15초 주기
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          지금 새로고침
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">오늘 변경 건수</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayUpdates}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">지난 7일 변경 건수</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.last7DaysUpdates}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">가장 많이 변경된 필드</p>
              {stats.topFields.length > 0 ? (
                <div className="space-y-1">
                  {stats.topFields.map((field, index) => (
                    <div key={field} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                      <span className="text-sm font-semibold text-gray-900">{field}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">데이터 없음</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 날짜 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'today' | '7days' | 'all')}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="7days">지난 7일</option>
                <option value="today">오늘</option>
              </select>
            </div>

            {/* 필드명 검색 */}
            <div>
              <Input
                label="필드명 검색"
                placeholder="예: 회사, 연락처, 항공"
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
              />
            </div>

            {/* 참가자 검색 */}
            <div>
              <Input
                label="참가자 검색"
                placeholder="이름 또는 이메일"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 변경 로그 리스트 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">변경 로그</CardTitle>
          <CardDescription>
            총 {filteredLogs.length}건의 변경 이력이 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">조건에 맞는 변경 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const participant = log.participant || {
                  name: log.metadata?.participant_name || '알 수 없음',
                  email: log.metadata?.participant_email || '',
                };
                const changes = log.metadata?.changes || [];
                const participantId = log.metadata?.participant_id || log.participant?.id;

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border border-blue-200 bg-blue-50/60 transition-colors hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* 왼쪽: 시간 + 참가자 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{formatDateTime(log.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{participant.name}</span>
                          {participant.email && (
                            <>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {participant.email}
                              </div>
                            </>
                          )}
                        </div>

                        {/* 변경된 필드들 */}
                        {changes.length > 0 && (
                          <div className="space-y-1.5">
                            {changes.map((change: any, index: number) => (
                              <div
                                key={index}
                                className="inline-flex items-center gap-2 px-2 py-1 bg-white rounded border border-blue-200 text-sm mr-2 mb-1"
                              >
                                <span className="font-medium text-blue-900">{change.field}:</span>
                                <span className="text-gray-600">
                                  <span className="line-through text-gray-400">
                                    {change.before ?? '(없음)'}
                                  </span>
                                  <span className="mx-2 text-blue-600">→</span>
                                  <span className="font-semibold text-blue-900">
                                    {change.after ?? '(없음)'}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 오른쪽: 액션 */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {log.actor && (
                          <span className="text-xs text-gray-500">by {log.actor}</span>
                        )}
                        {participantId && (
                          <Link
                            href={`/admin/events/${eventId}/participants/${participantId}/edit`}
                            className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            참가자 상세 보기 →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

