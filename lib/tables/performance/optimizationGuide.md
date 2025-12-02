# Performance Optimization Implementation Guide

## Quick Wins (Phase 1) - Implementation Code

### 1. Memoize TableCard Component

**File**: `app/admin/events/[eventId]/tables/TableCard.tsx`

```tsx
import React from 'react';

export const TableCard = React.memo(function TableCard({ 
  table, 
  participants, 
  onDrop, 
  isDraftMode = false, 
  conflicts = [] 
}: TableCardProps) {
  // ... existing code
}, (prevProps, nextProps) => {
  // Custom comparison
  if (prevProps.table.id !== nextProps.table.id) return false;
  if (prevProps.isDraftMode !== nextProps.isDraftMode) return false;
  if (prevProps.participants.length !== nextProps.participants.length) return false;
  
  // Check if participant IDs changed
  const prevIds = prevProps.participants.map(p => p.id).sort().join(',');
  const nextIds = nextProps.participants.map(p => p.id).sort().join(',');
  if (prevIds !== nextIds) return false;
  
  // Check conflicts
  const prevConflictCount = prevProps.conflicts?.filter(c => c.tableId === prevProps.table.id).length || 0;
  const nextConflictCount = nextProps.conflicts?.filter(c => c.tableId === nextProps.table.id).length || 0;
  if (prevConflictCount !== nextConflictCount) return false;
  
  return true;
});
```

**Expected Impact**: 60-70% reduction in TableCard re-renders

---

### 2. Build Participant Lookup Map Once

**File**: `app/admin/events/[eventId]/tables/ConflictInspector.ts`

```typescript
export function inspectConflicts(
  assignments: TableAssignment[],
  tables: TableForAssignment[],
  participants: Participant[]
): ConflictInspectionResult {
  const conflicts: Conflict[] = [];

  // Build participant lookup map ONCE (optimization)
  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  // ... existing code ...

  // Replace participants.find() with map lookup
  for (const [participantId, tableIds] of participantTableMap.entries()) {
    if (tableIds.length > 1) {
      const participant = participantMap.get(participantId); // O(1) instead of O(N)
      conflicts.push({
        type: 'duplicate_assignment',
        severity: 'error',
        participantIds: [participantId],
        participants: participant ? [participant] : [],
        details: `Participant "${participant?.name || participantId}" is assigned to ${tableIds.length} tables`,
      });
    }
  }

  // ... rest of code ...
}
```

**Expected Impact**: 20-30% faster conflict inspection

---

### 3. Debounce Conflict Inspection

**File**: `app/admin/events/[eventId]/tables/TablesPageClient.tsx`

```tsx
import { useMemo, useRef, useEffect } from 'react';
import { inspectConflicts } from './ConflictInspector';

// Add debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// In component:
const debouncedAssignments = useDebounce(localDraftAssignments, 300);

const conflictResult = useMemo(() => {
  if (!isDraftMode) {
    return { conflicts: [], hasErrors: false, hasWarnings: false };
  }
  return inspectConflicts(debouncedAssignments, tables, participants);
}, [debouncedAssignments, tables, participants, isDraftMode]);
```

**Expected Impact**: 80% reduction in conflict inspection calls during drag

---

### 4. Optimize TableList Participant Mapping

**File**: `app/admin/events/[eventId]/tables/TableList.tsx`

```tsx
import { useMemo } from 'react';

export function TableList({ tables, assignments, participants, onMove, isDraftMode = false, conflicts = [] }: TableListProps) {
  // Build participant lookup map once
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) {
      map.set(p.id, p);
    }
    return map;
  }, [participants]);

  // Build table assignments map once
  const tableAssignmentsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of assignments) {
      if (!map.has(a.tableId)) {
        map.set(a.tableId, []);
      }
      map.get(a.tableId)!.push(a.participantId);
    }
    return map;
  }, [assignments]);

  // Memoize participant arrays per table
  const tableParticipantsMap = useMemo(() => {
    const result = new Map<string, Participant[]>();
    for (const table of tables) {
      const participantIds = tableAssignmentsMap.get(table.id) || [];
      const tableParticipants = participantIds
        .map((pid) => participantMap.get(pid))
        .filter((p): p is Participant => p !== undefined);
      result.set(table.id, tableParticipants);
    }
    return result;
  }, [tables, tableAssignmentsMap, participantMap]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {tables.map((t) => (
        <TableCard
          key={t.id}
          table={t}
          participants={tableParticipantsMap.get(t.id) || []}
          onDrop={onMove}
          isDraftMode={isDraftMode}
          conflicts={conflicts}
        />
      ))}
    </div>
  );
}
```

**Expected Impact**: 50% faster TableList rendering

---

### 5. Pre-filter Available Tables (RoundRobin)

**File**: `lib/tables/algorithms/roundRobin.ts`

```typescript
export function roundRobin(
  options: TableAssignmentOptions,
  participants: ParticipantForAssignment[],
  tables: TableForAssignment[]
): TableAssignmentResult {
  const batchId = randomUUID();
  const tableStates = createInitialTableStates(tables);

  // Pre-filter available tables (optimization)
  let availableTables = tableStates.filter(ts => ts.remainingCapacity > 0);
  let tableIndex = 0;

  for (const p of participants) {
    // Use pre-filtered list instead of checking all tables
    if (availableTables.length === 0) break;

    const targetTable = availableTables[tableIndex % availableTables.length];
    
    if (targetTable && targetTable.remainingCapacity > 0) {
      targetTable.participants.push(p);
      targetTable.remainingCapacity -= 1;
      if (p.isVip) {
        targetTable.vipCount += 1;
      }

      // Remove from available if full
      if (targetTable.remainingCapacity === 0) {
        availableTables = availableTables.filter(ts => ts.remainingCapacity > 0);
      }

      tableIndex = (tableIndex + 1) % availableTables.length;
    }
  }

  // ... rest of code ...
}
```

**Expected Impact**: 30-40% faster for N>300

---

## Medium Effort (Phase 2) - Priority Queue Implementation

### 6. Replace Sorting with Priority Queue

**File**: `lib/tables/assignmentUtils.ts`

```typescript
// Add priority queue implementation
class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Optimized pickTableWithLeastVip using heap
export function pickTableWithLeastVip(
  tables: TableState[]
): TableState | undefined {
  const available = tables.filter((t) => t.remainingCapacity > 0);
  if (available.length === 0) return undefined;

  // Use heap instead of sort
  const heap = new MinHeap<TableState>((a, b) => {
    if (a.vipCount !== b.vipCount) {
      return a.vipCount - b.vipCount;
    }
    return a.participants.length - b.participants.length;
  });

  for (const table of available) {
    heap.push(table);
  }

  return heap.peek();
}

// Similar optimization for pickTableWithMostRemainingCapacity
export function pickTableWithMostRemainingCapacity(
  tables: TableState[]
): TableState | undefined {
  const available = tables.filter((t) => t.remainingCapacity > 0);
  if (available.length === 0) return undefined;

  const heap = new MinHeap<TableState>((a, b) => 
    b.remainingCapacity - a.remainingCapacity
  );

  for (const table of available) {
    heap.push(table);
  }

  return heap.peek();
}
```

**Expected Impact**: 50-70% faster for algorithms using these functions

---

## Database Optimizations

### 7. Optimize page.tsx Queries

**File**: `app/admin/events/[eventId]/tables/page.tsx`

```typescript
// Build participant lookup map once
const participantMap = useMemo(() => {
  const map = new Map<string, Participant>();
  for (const p of participants) {
    map.set(p.id, p);
  }
  return map;
}, [participants]);

// Single pass through assignments
const assignmentsDraft: TableAssignment[] = [];
const assignmentsConfirmed: TableAssignment[] = [];

if (assignmentsData) {
  for (const assignment of assignmentsData as TableAssignmentRow[]) {
    const table = tables.find((t) => t.id === assignment.table_id);
    if (!table) continue;

    const participant = participantMap.get(assignment.participant_id); // O(1) lookup
    const assignmentObj: TableAssignment = {
      participantId: assignment.participant_id,
      tableId: assignment.table_id,
      tableName: table.name,
      isVip: participant?.is_vip ?? false,
    };

    // Single conditional push
    (assignment.is_draft ? assignmentsDraft : assignmentsConfirmed).push(assignmentObj);
  }
}
```

**Expected Impact**: 10-15% faster data processing

---

## Implementation Checklist

- [ ] Memoize TableCard component
- [ ] Build participant lookup map in ConflictInspector
- [ ] Debounce conflict inspection
- [ ] Optimize TableList participant mapping
- [ ] Pre-filter available tables in roundRobin
- [ ] Implement priority queue for table selection
- [ ] Optimize page.tsx participant lookup
- [ ] Add database indexes
- [ ] Virtualize DiffViewer for large lists
- [ ] Paginate version history

---

## Testing After Optimization

Run the profiling script again:

```bash
npx tsx lib/tables/performance/runProfiling.ts
```

Compare results with baseline to verify improvements.

