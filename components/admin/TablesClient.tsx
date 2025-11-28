'use client';

import { useState, useTransition } from 'react';
import { Table, Users, UserCheck, UserX, Shuffle, RotateCcw, CheckCircle, Crown, Search, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { autoAssignV2Action } from '@/actions/tables/autoAssignV2';
import { applyDraftAssignmentsAction } from '@/actions/tables/applyDraft';
import { clearDraftAssignmentsAction } from '@/actions/tables/clearDraft';
import { manualAssignAction } from '@/actions/tables/manualAssign';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 타입 정의
interface Participant {
  id: string;
  name: string;
  email: string;
  company: string | null;
  vipLevel: number;
}

interface TableAssignment {
  assignmentId: string;
  participantId: string;
  name: string;
  company: string | null;
  vipLevel: number;
  seatNumber: number | null;
  isDraft: boolean;
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
  confirmedAssignments: TableAssignment[];
  draftAssignments: TableAssignment[];
  totalAssigned: number;
}

interface TablesClientProps {
  eventId: string;
  summary: {
    totalParticipants: number;
    tableCount: number;
    assignedCount: number;
    unassignedCount: number;
    draftCount?: number;
    confirmedCount?: number;
  };
  tables: TableData[];
  unassignedParticipants: Participant[];
}

// Droppable Empty Seat
function EmptySeatDropZone({
  tableId,
  seatNumber,
}: {
  tableId: string;
  seatNumber: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-seat-${tableId}-${seatNumber}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2 rounded-lg border-2 border-dashed text-xs
        ${isOver ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'}
        transition-colors
      `}
    >
      <div className="text-center text-gray-400 py-2">
        <div className="text-[10px]">좌석 {seatNumber}</div>
        <div className="text-[9px] mt-1">빈 좌석</div>
      </div>
    </div>
  );
}

// Draggable Seat Item
function SeatItem({
  assignment,
  seatNumber,
  isDraft,
  isDragging,
  tableId,
}: {
  assignment: TableAssignment;
  seatNumber: number;
  isDraft: boolean;
  isDragging: boolean;
  tableId: string;
}) {
  const seatId = `seat-${tableId}-${seatNumber}-${assignment.assignmentId}`;

  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id: seatId,
    disabled: !isDraft, // Draft만 드래그 가능
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraft ? { ...attributes, ...listeners } : {})}
      className={`
        p-2 rounded-lg border-2 text-xs
        ${isDraft
          ? 'bg-amber-50 border-amber-300 border-dashed cursor-move hover:bg-amber-100'
          : 'bg-blue-50 border-blue-300 cursor-default'}
      `}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-900">{assignment.name}</span>
          {assignment.vipLevel > 0 && (
            <Crown className="h-3 w-3 text-amber-600" />
          )}
        </div>
        {assignment.company && (
          <div className="text-gray-600 text-[10px] truncate">{assignment.company}</div>
        )}
        {isDraft && (
          <div className="text-[10px] text-amber-600 font-medium mt-1">DRAFT</div>
        )}
      </div>
    </div>
  );
}

// Draggable Unassigned Participant Item
function UnassignedParticipantItem({ participant }: { participant: Participant }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: `unassigned-${participant.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 hover:border-blue-300 transition"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{participant.name}</span>
            {participant.vipLevel > 0 && (
              <Crown className="h-4 w-4 text-amber-600" />
            )}
          </div>
          {participant.company && (
            <div className="text-xs text-gray-500 mt-1">{participant.company}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table Card Component
function TableCard({
  table,
}: {
  table: TableData;
}) {
  // 모든 좌석 배열 생성 (capacity 기준)
  const allSeats = Array.from({ length: table.capacity }, (_, i) => i + 1);

  // 좌석별 배정 정보 매핑
  const seatMap = new Map<number, TableAssignment>();
  [...table.confirmedAssignments, ...table.draftAssignments].forEach((assignment) => {
    if (assignment.seatNumber) {
      seatMap.set(assignment.seatNumber, assignment);
    }
  });

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{table.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {table.totalAssigned}/{table.capacity}
            </span>
            {table.draftAssignments.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                Draft: {table.draftAssignments.length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {allSeats.map((seatNumber) => {
            const assignment = seatMap.get(seatNumber);
            return assignment ? (
              <SeatItem
                key={seatNumber}
                assignment={assignment}
                seatNumber={seatNumber}
                isDraft={assignment.isDraft}
                isDragging={false}
                tableId={table.id}
              />
            ) : (
              <EmptySeatDropZone
                key={seatNumber}
                tableId={table.id}
                seatNumber={seatNumber}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Assignment Options Panel
function TableAssignmentOptionsPanel({
  eventId,
  algorithm,
  onAlgorithmChange,
  onAutoAssign,
  onClearDraft,
  onApplyDraft,
  isPending,
  draftCount,
  confirmedCount,
}: {
  eventId: string;
  algorithm: 'round_robin' | 'vip_spread' | 'group_by_company';
  onAlgorithmChange: (alg: 'round_robin' | 'vip_spread' | 'group_by_company') => void;
  onAutoAssign: () => void;
  onClearDraft: () => void;
  onApplyDraft: () => void;
  isPending: boolean;
  draftCount: number;
  confirmedCount: number;
}) {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">배정 옵션</CardTitle>
        <CardDescription>알고리즘을 선택하고 자동 배정을 실행하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">알고리즘</label>
          <select
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as any)}
            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isPending}
          >
            <option value="round_robin">Round Robin (기본)</option>
            <option value="vip_spread">VIP 분산</option>
            <option value="group_by_company">그룹(회사) 기준</option>
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">확정 배정</span>
            <span className="font-semibold text-gray-900">{confirmedCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Draft 배정</span>
            <span className="font-semibold text-amber-600">{draftCount}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={onAutoAssign}
            disabled={isPending}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Draft 자동 배정 실행
          </Button>

          <Button
            variant="secondary"
            className="w-full"
            onClick={onClearDraft}
            disabled={isPending || draftCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Draft 초기화
          </Button>

          <Button
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={onApplyDraft}
            disabled={isPending || draftCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Draft 확정하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Unassigned Panel
function UnassignedPanel({
  participants,
  searchQuery,
  onSearchChange,
}: {
  participants: Participant[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const filtered = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortableItems = filtered.map((p) => `unassigned-${p.id}`);

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserX className="h-5 w-5 text-amber-600" />
          미배정 참가자 ({participants.length})
        </CardTitle>
        <CardDescription>드래그하여 테이블 좌석으로 이동하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="이름, 이메일, 회사로 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.length > 0 ? (
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
              {filtered.map((participant) => (
                <UnassignedParticipantItem key={participant.id} participant={participant} />
              ))}
            </SortableContext>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchQuery ? '검색 결과가 없습니다.' : '미배정 참가자가 없습니다.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main TablesClient Component
export default function TablesClient({
  eventId,
  summary,
  tables: initialTables,
  unassignedParticipants: initialUnassigned,
}: TablesClientProps) {
  const [algorithm, setAlgorithm] = useState<'round_robin' | 'vip_spread' | 'group_by_company'>('round_robin');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tables, setTables] = useState(initialTables);
  const [unassignedParticipants, setUnassignedParticipants] = useState(initialUnassigned);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAutoAssign = () => {
    startTransition(async () => {
      try {
        const result = await autoAssignV2Action({ eventId, algorithm });
        toast.success(
          `Draft 배정 완료: ${result.assignedCount}/${result.totalParticipants}명 배정 (미배정 ${result.unassignedCount}명)`
        );
        window.location.reload();
      } catch (error: any) {
        console.error('Auto assign error:', error);
        toast.error(error?.message || '자동 배정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleClearDraft = () => {
    if (!confirm('Draft 배정을 모두 초기화하시겠습니까?')) {
      return;
    }

    startTransition(async () => {
      try {
        await clearDraftAssignmentsAction(eventId);
        toast.success('Draft 배정을 초기화했습니다.');
        window.location.reload();
      } catch (error: any) {
        console.error('Clear draft error:', error);
        toast.error(error?.message || 'Draft 초기화 중 오류가 발생했습니다.');
      }
    });
  };

  const handleApplyDraft = () => {
    if (!confirm('Draft 배정을 확정하시겠습니까? 기존 확정 배정은 삭제됩니다.')) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await applyDraftAssignmentsAction(eventId);
        toast.success(`배정 확정 완료: ${result.totalAssignments}명`);
        window.location.reload();
      } catch (error: any) {
        console.error('Apply draft error:', error);
        toast.error(error?.message || '배정 확정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 미배정 참가자를 좌석으로 드롭
    if (activeId.startsWith('unassigned-')) {
      const participantId = activeId.replace('unassigned-', '');
      
      // 좌석으로 드롭한 경우 (empty-seat-{tableId}-{seatNumber} 형식)
      if (overId.startsWith('empty-seat-')) {
        const parts = overId.split('-');
        if (parts.length >= 4) {
          const tableId = parts[2];
          const seatNumber = parseInt(parts[3], 10);
          
          const targetTable = tables.find((t) => t.id === tableId);
          if (targetTable) {
            // 기존 배정 확인
            const existingAssignment = [...targetTable.confirmedAssignments, ...targetTable.draftAssignments]
              .find((a) => a.seatNumber === seatNumber);

            if (existingAssignment) {
              toast.error('이 좌석에는 이미 참가자가 배정되어 있습니다.');
              return;
            }

            startTransition(async () => {
              try {
                await manualAssignAction({
                  eventId,
                  toTableId: tableId,
                  toSeatNumber: seatNumber,
                  participantId,
                });
                toast.success('배정이 완료되었습니다.');
                window.location.reload();
              } catch (error: any) {
                console.error('Manual assign error:', error);
                toast.error(error?.message || '배정 중 오류가 발생했습니다.');
              }
            });
          }
        }
      }
    }
    // 좌석 간 이동 (seat-{tableId}-{seatNumber}-{assignmentId} 형식)
    else if (activeId.startsWith('seat-')) {
      const activeParts = activeId.split('-');
      if (activeParts.length >= 5) {
        const sourceTableId = activeParts[1];
        const sourceSeatNumber = parseInt(activeParts[2], 10);
        const assignmentId = activeParts.slice(3).join('-');
        
        // 기존 배정 찾기
        const sourceTable = tables.find((t) => t.id === sourceTableId);
        if (!sourceTable) return;

        const sourceAssignment = [...sourceTable.confirmedAssignments, ...sourceTable.draftAssignments]
          .find((a) => a.assignmentId === assignmentId);

        if (!sourceAssignment) return;

        // Draft만 이동 가능
        if (!sourceAssignment.isDraft) {
          toast.error('확정된 배정은 이동할 수 없습니다. Draft로 변경 후 이동하세요.');
          return;
        }

        // 다른 좌석으로 드롭
        if (overId.startsWith('empty-seat-')) {
          const overParts = overId.split('-');
          if (overParts.length >= 4) {
            const targetTableId = overParts[2];
            const targetSeatNumber = parseInt(overParts[3], 10);

            const targetTable = tables.find((t) => t.id === targetTableId);
            if (targetTable) {
              // 기존 배정 확인
              const existingAssignment = [...targetTable.confirmedAssignments, ...targetTable.draftAssignments]
                .find((a) => a.seatNumber === targetSeatNumber);

              if (existingAssignment) {
                toast.error('이 좌석에는 이미 참가자가 배정되어 있습니다.');
                return;
              }

              startTransition(async () => {
                try {
                  await manualAssignAction({
                    eventId,
                    fromAssignmentId: assignmentId,
                    toTableId: targetTableId,
                    toSeatNumber: targetSeatNumber,
                    participantId: sourceAssignment.participantId,
                  });
                  toast.success('좌석이 이동되었습니다.');
                  window.location.reload();
                } catch (error: any) {
                  console.error('Manual assign error:', error);
                  toast.error(error?.message || '좌석 이동 중 오류가 발생했습니다.');
                }
              });
            }
          }
        }
      }
    }
  };

  const draftCount = summary.draftCount || 0;
  const confirmedCount = summary.confirmedCount || 0;

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
                <p className="text-sm text-gray-500 mb-1">확정 배정</p>
                <p className="text-2xl font-semibold text-gray-900">{confirmedCount}</p>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 lg:grid-cols-[300px_1fr_300px]">
          {/* 좌측: 배정 옵션 패널 */}
          <TableAssignmentOptionsPanel
            eventId={eventId}
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            onAutoAssign={handleAutoAssign}
            onClearDraft={handleClearDraft}
            onApplyDraft={handleApplyDraft}
            isPending={isPending}
            draftCount={draftCount}
            confirmedCount={confirmedCount}
          />

          {/* 중앙: 테이블 그리드 */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          </div>

          {/* 우측: 미배정 리스트 */}
          <UnassignedPanel
            participants={unassignedParticipants}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="p-3 bg-white border-2 border-blue-400 rounded-lg shadow-lg">
              {activeId.startsWith('unassigned-') ? (
                <div className="text-sm font-medium">드래그 중...</div>
              ) : (
                <div className="text-sm font-medium">좌석 이동 중...</div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
