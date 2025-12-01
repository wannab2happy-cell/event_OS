# Table Assignment Engine 로드맵

## 현재 상태
- table_assignments v2 스키마 존재 (is_draft, source, batch_id 등 이미 추가됨)
- lib/types.ts 안에 Table, TableAssignment 관련 타입 정의 완료
- lib/tables/assignmentTypes.ts - 엔진 공통 타입/인터페이스 정의 완료

## 진행 단계

### ✅ Step 1 — 엔진 공통 타입·인터페이스 정리 (완료)
- [x] `lib/tables/assignmentTypes.ts` 생성
  - TableAssignmentAlgorithm 타입 정의
  - ParticipantForAssignment 인터페이스
  - TableForAssignment 인터페이스
  - TableAssignmentOptions 인터페이스
  - AssignmentResultItem 인터페이스
  - TableAssignmentResult 인터페이스
- [x] `lib/types.ts` 확장
  - Table 인터페이스 추가
  - TableAssignment 인터페이스 추가 (v2 스키마 기반)

### Step 2 — 서버 액션 정리 (예정)
- [ ] `actions/tables/runDraftAssignment.ts` - 드래프트 배정 실행
- [ ] `actions/tables/confirmAssignment.ts` - 배정 확정
- [ ] `actions/tables/clearDraft.ts` - 드래프트 삭제

**공통 함수 설계 방향:**
- `loadParticipantsForAssignment(eventId)` → `ParticipantForAssignment[]` 반환
- `loadTablesForAssignment(eventId)` → `TableForAssignment[]` 반환
- `runAlgorithm(options, participants, tables)` → `TableAssignmentResult` 반환

### Step 3 — Admin UI (예정)
- [ ] `/admin/events/[eventId]/tables/assign` - 테이블 배정 콘솔 화면

### Step 4 — 참가자/테이블 리스트 연동 (예정)
- [ ] 실시간 반영 (좌석 표시)

### Step 5 — 예외/락/로그 (예정)
- [ ] Undo 기능
- [ ] 재배정 이력
- [ ] 최소 버전

---

## 타입 계약

모든 알고리즘/서버 액션/UI는 `lib/tables/assignmentTypes.ts`에 정의된 타입 계약을 따릅니다.

**핵심 타입:**
- `TableAssignmentAlgorithm`: 알고리즘 종류
- `ParticipantForAssignment`: 배정 대상 참가자
- `TableForAssignment`: 배정 대상 테이블
- `TableAssignmentOptions`: 알고리즘 실행 옵션
- `TableAssignmentResult`: 배정 결과

**DB 타입:**
- `Table`: 테이블 정보 (lib/types.ts)
- `TableAssignment`: 테이블 배정 정보 (lib/types.ts)

