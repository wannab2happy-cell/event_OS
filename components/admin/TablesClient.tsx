'use client';

import { useState, useTransition } from 'react';
import { Table, Users, UserCheck, UserX, Shuffle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { assignTablesAction } from '@/actions/tables/assignTables';
import { clearAssignmentsAction } from '@/actions/tables/clearAssignments';
import toast from 'react-hot-toast';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  assignedCount: number;
  participants: Array<{
    id: string;
    name: string;
    company: string | null;
  }>;
}

interface TablesClientProps {
  eventId: string;
  summary: {
    totalParticipants: number;
    tableCount: number;
    assignedCount: number;
    unassignedCount: number;
  };
  tables: TableData[];
}

export default function TablesClient({ eventId, summary, tables: initialTables }: TablesClientProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialTables[0]?.id ?? null
  );
  const [isPending, startTransition] = useTransition();

  const selectedTable = initialTables.find((t) => t.id === selectedTableId) || null;

  const handleAutoAssign = () => {
    startTransition(async () => {
      try {
        const result = await assignTablesAction({ eventId });
        toast.success(
          `배정 완료: ${result.assignedCount}/${result.totalParticipants}명 배정 (미배정 ${result.unassignedCount}명)`
        );
        // 페이지 새로고침하여 데이터 업데이트
        window.location.reload();
      } catch (error: any) {
        console.error('Assign tables error:', error);
        toast.error(error?.message || '테이블 배정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleReset = () => {
    if (!confirm('모든 테이블 배정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    startTransition(async () => {
      try {
        await clearAssignmentsAction({ eventId });
        toast.success('테이블 배정을 초기화했습니다.');
        // 페이지 새로고침하여 데이터 업데이트
        window.location.reload();
      } catch (error: any) {
        console.error('Clear assignments error:', error);
        toast.error(error?.message || '초기화 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 참가자</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 테이블</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.tableCount}</p>
              </div>
              <Table className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">배정 완료</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.assignedCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">미배정</p>
                <p className="text-2xl font-semibold text-gray-900">{summary.unassignedCount}</p>
              </div>
              <UserX className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* 좌측: 테이블 리스트 */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Table className="h-5 w-5 text-blue-600" />
              테이블 목록
            </CardTitle>
            <CardDescription>테이블을 선택하여 좌석을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[calc(100vh-300px)] overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {initialTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isFull = table.assignedCount >= table.capacity;
                const vacancy = table.capacity - table.assignedCount;

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`w-full text-left p-4 transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm text-gray-900">{table.name}</div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          isFull
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {table.assignedCount}/{table.capacity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {isFull ? '만석' : `여유: ${vacancy}석`}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 우측: 선택된 테이블 상세 */}
        <div className="space-y-6">
          {selectedTable ? (
            <>
              {/* 테이블 정보 */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTable.name}</CardTitle>
                      <CardDescription>
                        정원: {selectedTable.capacity}명 | 배정: {selectedTable.assignedCount}명
                      </CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedTable.assignedCount >= selectedTable.capacity
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedTable.assignedCount >= selectedTable.capacity ? '만석' : '여유 있음'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 좌석 배치 시각화 (간단한 그리드) */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">좌석 배치</p>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: selectedTable.capacity }).map((_, index) => {
                        const participant = selectedTable.participants[index];
                        const isOccupied = !!participant;

                        return (
                          <div
                            key={index}
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium ${
                              isOccupied
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                            title={participant ? `${participant.name} (${participant.company})` : '빈 좌석'}
                          >
                            {isOccupied ? (
                              <div className="text-center">
                                <div className="font-semibold">{participant.name.split('')[0]}</div>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 참가자 목록 */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">배정된 참가자</p>
                    {selectedTable.participants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTable.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                              {participant.company && (
                                <p className="text-xs text-gray-500">{participant.company}</p>
                              )}
                            </div>
                            <button className="text-xs text-red-600 hover:text-red-700">
                              제거
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">배정된 참가자가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 액션 버튼 */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={handleAutoAssign}
                      disabled={isPending}
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      {isPending ? '배정 중...' : '자동 배정'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleReset}
                      disabled={isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      초기화
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border border-gray-200">
              <CardContent className="p-12 text-center">
                <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">왼쪽에서 테이블을 선택하세요.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

