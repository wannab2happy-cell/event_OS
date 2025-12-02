'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { TableForAssignment, TableAssignment, TableAssignmentAlgorithm } from '@/lib/tables/assignmentTypes';
import { AlgorithmSelector } from './AlgorithmSelector';
import { TableAssignmentPanel } from './TableAssignmentPanel';
import { TableList } from './TableList';
import { DragDropProvider } from './DragDropProvider';
import { SaveDraftButton } from './SaveDraftButton';
import { inspectConflicts, Conflict, ConflictInspectionResult } from './ConflictInspector';
import { fixConflict, FixResult } from './SmartFixer';
import { rebalanceAssignments } from './SmartRebalance';
import { SmartSuggestionPanel } from './SmartSuggestionPanel';
import { PreviewModal } from './PreviewModal';
import { UndoRedoToolbar } from './UndoRedoToolbar';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { AssignmentVersion, getAssignmentVersions } from '@/actions/tables/getAssignmentVersions';
import { restoreAssignmentVersion } from '@/actions/tables/restoreAssignmentVersion';
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyId?: string | null;
  companyName?: string | null;
}

interface TablesPageClientProps {
  eventId: string;
  tables: TableForAssignment[];
  participants: Participant[];
  assignmentsDraft: TableAssignment[];
  assignmentsConfirmed: TableAssignment[];
}

export function TablesPageClient({
  eventId,
  tables,
  participants,
  assignmentsDraft,
  assignmentsConfirmed,
}: TablesPageClientProps) {
  const router = useRouter();
  const [algorithm, setAlgorithm] = useState<TableAssignmentAlgorithm>('round_robin');
  const [versions, setVersions] = useState<AssignmentVersion[]>([]);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);

  const hasDraft = assignmentsDraft.length > 0;
  const hasConfirmed = assignmentsConfirmed.length > 0;
  const isDraftMode = hasDraft;

  // Lazy-load versions when panel is opened
  const loadVersions = useCallback(async () => {
    if (versionsLoaded) return;
    
    try {
      const result = await getAssignmentVersions(eventId, 0);
      setVersions(result.versions);
      setVersionsLoaded(true);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  }, [eventId, versionsLoaded]);

  // Load versions when draft mode is enabled
  useEffect(() => {
    if (isDraftMode && !versionsLoaded) {
      loadVersions();
    }
  }, [isDraftMode, versionsLoaded, loadVersions]);

  // 로컬 상태: draft 모드에서 편집 가능한 배정
  // 초기값은 서버의 draft 배정
  const [localDraftAssignments, setLocalDraftAssignments] = useState<TableAssignment[]>(() => assignmentsDraft);

  // Undo/Redo 스택
  const [undoStack, setUndoStack] = useState<TableAssignment[][]>([]);
  const [redoStack, setRedoStack] = useState<TableAssignment[][]>([]);

  // 상태 변경 시 Undo 스택에 추가하는 헬퍼 (moveParticipant에서 직접 처리하므로 제거)
  // moveParticipant는 직접 setLocalDraftAssignments를 사용하여 최적화됨

  // 서버의 draft가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    if (isDraftMode && assignmentsDraft.length > 0) {
      // 서버 상태와 로컬 상태가 다른지 확인
      const serverIds = new Set(
        assignmentsDraft.map((a) => `${a.participantId}-${a.tableId}`)
      );
      const localIds = new Set(
        localDraftAssignments.map((a) => `${a.participantId}-${a.tableId}`)
      );
      
      // 서버와 로컬이 다르면 서버 상태로 업데이트
      if (serverIds.size !== localIds.size || 
          !Array.from(serverIds).every((id) => localIds.has(id))) {
        // 로컬 변경사항이 있는지 확인 (간단한 휴리스틱)
        const hasLocalChanges = localDraftAssignments.length > 0 && 
          localDraftAssignments.some((la) => 
            !assignmentsDraft.some((da) => 
              da.participantId === la.participantId && da.tableId === la.tableId
            )
          );
        
        // 로컬 변경사항이 없거나 서버에서 새로 생성된 경우에만 업데이트
        if (!hasLocalChanges || localDraftAssignments.length === 0) {
          setLocalDraftAssignments(assignmentsDraft);
        }
      }
    } else if (!isDraftMode) {
      // Draft 모드가 아니면 로컬 상태 초기화
      setLocalDraftAssignments([]);
    }
  }, [assignmentsDraft, isDraftMode]);

  // Draft 모드에서는 로컬 상태 사용, Confirm 모드에서는 서버 상태 사용
  const currentAssignments = isDraftMode ? localDraftAssignments : assignmentsConfirmed;

  // Build capacity map once (memoized)
  const capacityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tables) {
      map.set(t.id, t.capacity ?? Infinity);
    }
    return map;
  }, [tables]);

  // Build table name map once (memoized)
  const tableNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tables) {
      map.set(t.id, t.name);
    }
    return map;
  }, [tables]);

  // Build participant map once (memoized)
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) {
      map.set(p.id, p);
    }
    return map;
  }, [participants]);

  // 참가자를 특정 테이블로 이동 (optimized with useCallback)
  const moveParticipant = useCallback(
    (pid: string, targetTableId: string) => {
      if (!isDraftMode) return; // Confirm 모드에서는 이동 불가

      setLocalDraftAssignments((prev) => {
        // 1. 현재 할당된 테이블이 이미 같은 경우 → 변경 없음
        const current = prev.find((a) => a.participantId === pid);
        if (current && current.tableId === targetTableId) {
          return prev; // No change, prevent re-render
        }

        // 2. 타겟 테이블 용량 체크
        const countOnTarget = prev.filter((a) => a.tableId === targetTableId).length;
        const capacity = capacityMap.get(targetTableId) ?? Infinity;
        if (countOnTarget >= capacity) {
          alert(`Table "${tableNameMap.get(targetTableId) || targetTableId}" is at full capacity (${capacity}). Cannot add more participants.`);
          return prev; // No change, prevent re-render
        }

        // 3. 이전 상태를 undo 스택에 추가 (변경이 있을 때만)
        setUndoStack((stack) => [...stack, prev]);
        setRedoStack([]);

        // 4. 기존 할당 제거 + 신규 할당 추가
        const participant = participantMap.get(pid);
        if (!participant) return prev;

        const tableName = tableNameMap.get(targetTableId);
        if (!tableName) return prev;

        const filtered = prev.filter((a) => a.participantId !== pid);
        const newAssignment: TableAssignment = {
          participantId: pid,
          tableId: targetTableId,
          tableName: tableName,
          isVip: participant.isVip ?? false,
        };

        return [...filtered, newAssignment];
      });
    },
    [isDraftMode, capacityMap, tableNameMap, participantMap]
  );

  // SaveDraftButton에 전달할 형식으로 변환
  const assignmentsForSave = useMemo(() => {
    return localDraftAssignments.map((a) => ({
      tableId: a.tableId,
      participantId: a.participantId,
    }));
  }, [localDraftAssignments]);

  // Debounced conflict inspection state
  const [debouncedConflicts, setDebouncedConflicts] = useState<ConflictInspectionResult>({
    conflicts: [],
    hasErrors: false,
    hasWarnings: false,
  });

  // Conflict 검사 (디바운스 적용)
  useEffect(() => {
    if (!isDraftMode) {
      setDebouncedConflicts({ conflicts: [], hasErrors: false, hasWarnings: false });
      return;
    }

    const timer = setTimeout(() => {
      const result = inspectConflicts(localDraftAssignments, tables, participants);
      setDebouncedConflicts(result);
    }, 300);

    return () => clearTimeout(timer);
  }, [localDraftAssignments, participants, tables, isDraftMode]);

  const conflictResult = debouncedConflicts;

  // Preview 모달 상태
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    before: TableAssignment[];
    after: TableAssignment[];
    changes: string[];
  }>({
    isOpen: false,
    before: [],
    after: [],
    changes: [],
  });

  // 개별 Conflict Fix
  const handleFixConflict = useCallback((conflict: Conflict) => {
    if (!isDraftMode) return;

    const result = fixConflict(conflict, localDraftAssignments, tables, participants);
    
    setPreviewState({
      isOpen: true,
      before: localDraftAssignments,
      after: result.assignments,
      changes: result.changes,
    });
  }, [isDraftMode, localDraftAssignments, tables, participants]);

  // Preview에서 적용
  const handleApplyPreview = useCallback(() => {
    setLocalDraftAssignments((prev) => {
      // 이전 상태를 undo 스택에 추가
      setUndoStack((stack) => [...stack, prev]);
      setRedoStack([]);
      return previewState.after;
    });
    setPreviewState({ isOpen: false, before: [], after: [], changes: [] });
  }, [previewState.after]);

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    setLocalDraftAssignments((prev) => {
      const previousState = undoStack[undoStack.length - 1];
      setUndoStack((stack) => stack.slice(0, -1));
      setRedoStack((stack) => [...stack, prev]);
      return previousState;
    });
  }, [undoStack.length]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    setLocalDraftAssignments((prev) => {
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack((stack) => stack.slice(0, -1));
      setUndoStack((stack) => [...stack, prev]);
      return nextState;
    });
  }, [redoStack.length]);

  // Version 복원
  const handleRestoreVersion = useCallback(async (version: AssignmentVersion) => {
    try {
      await restoreAssignmentVersion({ eventId, versionId: version.id });
      router.refresh();
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert(error instanceof Error ? error.message : 'Failed to restore version');
    }
  }, [eventId, router]);

  // Preview 모달 닫기
  const handleClosePreview = useCallback(() => {
    setPreviewState({ isOpen: false, before: [], after: [], changes: [] });
  }, []);

  // 전체 Auto-Fix
  const handleFixAll = useCallback(() => {
    if (!isDraftMode) return;

    let currentAssignments = [...localDraftAssignments];
    const allChanges: string[] = [];

    // 에러부터 해결
    const errors = conflictResult.conflicts.filter((c) => c.severity === 'error');
    for (const conflict of errors) {
      const result = fixConflict(conflict, currentAssignments, tables, participants);
      currentAssignments = result.assignments;
      allChanges.push(...result.changes);
    }

    // 경고 해결
    const warnings = conflictResult.conflicts.filter((c) => c.severity === 'warning');
    for (const conflict of warnings) {
      const result = fixConflict(conflict, currentAssignments, tables, participants);
      currentAssignments = result.assignments;
      allChanges.push(...result.changes);
    }

    setPreviewState({
      isOpen: true,
      before: localDraftAssignments,
      after: currentAssignments,
      changes: allChanges,
    });
  }, [isDraftMode, localDraftAssignments, conflictResult.conflicts, tables, participants]);

  // Rebalance
  const handleRebalance = useCallback(() => {
    if (!isDraftMode) return;

    const result = rebalanceAssignments(localDraftAssignments, tables, participants);
    
    setPreviewState({
      isOpen: true,
      before: localDraftAssignments,
      after: result.assignments,
      changes: result.changes,
    });
  }, [isDraftMode, localDraftAssignments, tables, participants]);

  // Preview Conflict
  const handlePreviewConflict = useCallback((conflict: Conflict) => {
    if (!isDraftMode) return;

    const result = fixConflict(conflict, localDraftAssignments, tables, participants);
    
    setPreviewState({
      isOpen: true,
      before: localDraftAssignments,
      after: result.assignments,
      changes: result.changes,
    });
  }, [isDraftMode, localDraftAssignments, tables, participants]);

  // 키보드 단축키 (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    if (!isDraftMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undoStack.length > 0) {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (redoStack.length > 0) {
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraftMode, undoStack.length, redoStack.length]);

  return (
    <>
      <div className="flex items-center gap-4">
        <AlgorithmSelector
          value={algorithm}
          onChange={(v) => setAlgorithm(v as TableAssignmentAlgorithm)}
        />
      </div>

      <TableAssignmentPanel eventId={eventId} algorithm={algorithm} />

      {isDraftMode && (
        <>
          <UndoRedoToolbar
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          <VersionHistoryPanel
            versions={versions}
            currentAssignments={localDraftAssignments}
            tables={tables}
            participants={participants}
            onRestore={handleRestoreVersion}
            isLoading={!versionsLoaded}
          />

          <SmartSuggestionPanel
            conflicts={conflictResult.conflicts}
            onFix={handleFixConflict}
            onFixAll={handleFixAll}
            onPreview={handlePreviewConflict}
          />

          <div className="flex gap-2 my-4">
            <SaveDraftButton eventId={eventId} assignments={assignmentsForSave} />
            <button
              onClick={handleRebalance}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Rebalance All Tables
            </button>
          </div>
        </>
      )}

      <PreviewModal
        isOpen={previewState.isOpen}
        onClose={handleClosePreview}
        onApply={handleApplyPreview}
        beforeAssignments={previewState.before}
        afterAssignments={previewState.after}
        tables={tables}
        participants={participants}
        changes={previewState.changes}
      />

      <DragDropProvider>
        <TableList
          tables={tables}
          assignments={currentAssignments}
          participants={participants}
          onMove={isDraftMode ? moveParticipant : undefined}
          isDraftMode={isDraftMode}
          conflicts={isDraftMode ? conflictResult.conflicts : []}
        />
      </DragDropProvider>
    </>
  );
}

