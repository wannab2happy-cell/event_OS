'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

interface ChangeDiff {
  field: string;
  before: any;
  after: any;
}

interface LogParticipantUpdateInput {
  eventId: string;
  participantId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  actor?: string;
}

/**
 * 참가자 정보 변경 로그 기록 헬퍼 함수
 */
export async function logParticipantUpdate(input: LogParticipantUpdateInput): Promise<void> {
  try {
    const { eventId, participantId, before, after, actor } = input;

    // 변경된 필드 찾기
    const diff: ChangeDiff[] = [];
    const fieldLabels: Record<string, string> = {
      name: '이름',
      email: '이메일',
      phone: '연락처',
      company: '회사',
      position: '직책',
      passport_number: '여권번호',
      passport_expiry: '여권만료일',
      visa_required: '비자필요',
      gender: '성별',
      dob: '생년월일',
      seat_preference: '좌석선호도',
      arrival_date: '도착일',
      arrival_time: '도착시간',
      arrival_airport: '도착공항',
      arrival_flight: '도착항공편',
      departure_date: '출발일',
      departure_time: '출발시간',
      departure_airport: '출발공항',
      departure_flight: '출발항공편',
      hotel_check_in: '호텔체크인',
      hotel_check_out: '호텔체크아웃',
      room_preference: '객실타입',
      sharing_details: '동반자정보',
      flight_ticket_no: '항공권번호',
      guest_confirmation_no: '호텔확정번호',
      is_travel_confirmed: '항공확정',
      is_hotel_confirmed: '호텔확정',
      status: '상태',
      mobile_phone: '휴대전화',
      dietary_restrictions: '식이제한',
      note: '메모',
    };

    // 주요 필드 비교
    const fieldsToCheck = Object.keys(fieldLabels);
    
    for (const field of fieldsToCheck) {
      const beforeValue = before[field];
      const afterValue = after[field];
      
      // null/undefined 처리
      const beforeNormalized = beforeValue === null || beforeValue === undefined ? null : String(beforeValue);
      const afterNormalized = afterValue === null || afterValue === undefined ? null : String(afterValue);
      
      if (beforeNormalized !== afterNormalized) {
        diff.push({
          field: fieldLabels[field] || field,
          before: beforeValue,
          after: afterValue,
        });
      }
    }

    // 변경된 필드가 없으면 로그 기록하지 않음
    if (diff.length === 0) {
      return;
    }

    // 참가자 이름/이메일 가져오기 (메시지용)
    const participantName = after.name || before.name || after.email || before.email || '참가자';

    // 운영 로그 기록
    await createOperationLog({
      eventId,
      type: 'participant_update',
      message: `참가자 정보 수정: ${participantName}`,
      actor: actor || 'admin',
      metadata: {
        participant_id: participantId,
        changes: diff,
        participant_name: participantName,
        participant_email: after.email || before.email,
      },
    });
  } catch (error) {
    // 로그 기록 실패해도 업데이트는 성공한 것으로 처리
    console.error('logParticipantUpdate error:', error);
  }
}

