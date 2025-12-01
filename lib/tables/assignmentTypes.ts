// lib/tables/assignmentTypes.ts

/**
 * 테이블 배정 알고리즘 타입
 * - round_robin: 순차 배정
 * - vip_spread: VIP 분산 배정
 * - group_by_company: 회사 단위 배정
 */
export type TableAssignmentAlgorithm =
  | 'round_robin'          // 순차 배정
  | 'vip_spread'           // VIP 분산 배정
  | 'group_by_company';    // 회사 단위 배정

/**
 * 배정 대상 참가자 (엔진 내부용 최소 필드)
 */
export interface ParticipantForAssignment {
  id: string;
  name: string;
  company?: string | null;
  isVip?: boolean;
  groupKey?: string | null;      // 같은 그룹으로 묶고 싶은 기준 (예: 회사, 팀)
}

/**
 * 배정 대상 테이블 (엔진 내부용 최소 필드)
 */
export interface TableForAssignment {
  id: string;
  name: string;
  capacity: number;
  isVipTable?: boolean;
}

/**
 * 알고리즘 실행 옵션
 */
export interface TableAssignmentOptions {
  eventId: string;
  algorithm: TableAssignmentAlgorithm;

  // VIP 분산 시 VIP로 보는 기준 수
  vipMaxPerTable?: number;

  // 회사/그룹 단위 배정 시 허용 오차 등 향후 확장 여지
  respectCompanyGrouping?: boolean;

  // 메타 정보
  requestedBy: string; // 관리자 이메일
}

/**
 * 엔진이 반환하는 각 참가자별 배정 결과 (메모리 상)
 */
export interface AssignmentResultItem {
  participantId: string;
  tableId: string;
  tableName: string;
  isVip?: boolean;
}

/**
 * 전체 배정 결과 요약
 */
export interface TableAssignmentResult {
  eventId: string;
  algorithm: TableAssignmentAlgorithm;
  batchId: string; // DB에 저장할 때도 동일 batch_id 사용

  assignments: AssignmentResultItem[];

  summary: {
    totalParticipants: number;
    totalTables: number;
    unassignedCount: number;
    byTable: {
      tableId: string;
      tableName: string;
      assignedCount: number;
      capacity: number;
    }[];
  };
}

