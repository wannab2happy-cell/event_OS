'use server';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import type { ParticipantInfoCenterData } from '@/lib/types';

interface GetParticipantInfoCenterInput {
  eventId: string;
  participantId: string;
}

/**
 * Participant Info Center용 모든 데이터를 한 번에 가져오는 Server Action
 */
export async function getParticipantInfoCenter(
  input: GetParticipantInfoCenterInput
): Promise<ParticipantInfoCenterData> {
  await assertAdminAuth();
  
  const { eventId, participantId } = input;

  // 1) 기본 참가자 정보 조회
  const { data: participant, error: participantError } = await supabaseAdmin
    .from('event_participants')
    .select('*')
    .eq('id', participantId)
    .eq('event_id', eventId)
    .single();

  if (participantError || !participant) {
    throw notFound();
  }

  // 2) guest_of 참가자 이름 조회
  let guestOfName: string | null = null;
  if (participant.guest_of) {
    const { data: guestOfParticipant } = await supabaseAdmin
      .from('event_participants')
      .select('name')
      .eq('id', participant.guest_of)
      .eq('event_id', eventId)
      .single();

    guestOfName = guestOfParticipant?.name || null;
  }

  // 2-1) 테이블 배정 정보 조회 (확정 배정만)
  const { data: tableAssignment } = await supabaseAdmin
    .from('table_assignments')
    .select('table_id, tables(id, name)')
    .eq('event_id', eventId)
    .eq('participant_id', participantId)
    .eq('is_draft', false)
    .single();

  const tableName = tableAssignment?.tables ? (tableAssignment.tables as any).name : null;

  // 3) 체크인 로그 조회
  const { data: checkInLogs, error: checkInError } = await supabaseAdmin
    .from('checkin_logs')
    .select('*')
    .eq('event_id', eventId)
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false });

  if (checkInError) {
    console.error('Check-in logs fetch error:', checkInError);
  }

  // 4) 변경 로그 조회 (operation_logs에서 participant_update 타입만)
  const { data: operationLogs, error: operationError } = await supabaseAdmin
    .from('operation_logs')
    .select('*')
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .order('created_at', { ascending: false })
    .limit(100); // 최신 100개만

  if (operationError) {
    console.error('Operation logs fetch error:', operationError);
  }

  // 변경 로그에서 해당 참가자 관련 로그만 필터링
  const participantChangeLogs =
    operationLogs?.filter((log) => {
      const metadata = log.metadata as any;
      return metadata?.participant_id === participantId;
    }) || [];

  // 5) Internal Notes 조회
  // 현재 스키마에는 별도 notes 테이블이 없으므로, event_participants.note 필드를 사용
  // 향후 notes 테이블이 추가되면 여기서 조회하도록 수정
  const internalNotes: ParticipantInfoCenterData['internalNotes'] = [];
  
  // note 필드가 있고 비어있지 않으면 하나의 노트로 간주
  if (participant.note) {
    internalNotes.push({
      id: `note-${participant.id}`,
      createdAt: participant.updated_at || participant.created_at,
      updatedAt: participant.updated_at || null,
      authorEmail: null,
      authorName: null,
      content: participant.note,
      isPinned: false,
    });
  }

  // 6) Basic Info 구성
  const basic: ParticipantInfoCenterData['basic'] = {
    id: participant.id,
    eventId: participant.event_id,
    name: participant.name,
    email: participant.email,
    company: participant.company || null,
    position: participant.position || null,
    phone: participant.phone || null,
    mobile_phone: (participant as any).mobile_phone || null,
    country: null, // 스키마에 country 필드가 없으면 null
    status: participant.status,
    created_at: participant.created_at,
    updated_at: participant.updated_at,
    vip_level: participant.vip_level || null,
    guest_of: participant.guest_of || null,
    guest_of_name: guestOfName,
    tableName: tableName,
    isCheckedIn: participant.is_checked_in || null,
  };

  // 7) Travel Info 구성
  const travel: ParticipantInfoCenterData['travel'] = {
    departure_airport: participant.departure_airport || null,
    arrival_airport: participant.arrival_airport || null,
    departure_date: participant.departure_date || null,
    return_date: participant.departure_date || null, // return_date는 departure_date와 동일하게 처리 (왕복일 경우)
    arrival_date: participant.arrival_date || null, // 도착일
    departure_time: participant.departure_time || null,
    arrival_time: participant.arrival_time || null,
    flight_number_go: participant.arrival_flight || null, // 도착 항공편
    flight_number_return: participant.departure_flight || null, // 출발 항공편 (귀국)
    passport_name: participant.name || null, // passport_name은 name과 동일하게 처리
    passport_number: participant.passport_number || null,
    passport_expiry: participant.passport_expiry || null,
    special_request: participant.seat_preference || null, // seat_preference를 special_request로 매핑
    is_travel_confirmed: participant.is_travel_confirmed || null,
  };

  // 8) Hotel Info 구성
  const nights = participant.num_nights || null;
  const hotel: ParticipantInfoCenterData['hotel'] = {
    hotel_name: null, // 스키마에 hotel_name 필드가 없으면 null
    room_type: participant.room_preference || null,
    check_in_date: participant.hotel_check_in || null,
    check_out_date: participant.hotel_check_out || null,
    nights: nights,
    confirmation_number: participant.guest_confirmation_no || null,
    roommate_name: participant.sharing_details || null, // sharing_details를 roommate_name으로 매핑
    smoking_preference: null, // 스키마에 smoking_preference 필드가 없으면 null
    is_hotel_confirmed: participant.is_hotel_confirmed || null,
  };

  // 9) Check-in Logs 구성
  const checkInLogsData: ParticipantInfoCenterData['checkInLogs'] =
    checkInLogs?.map((log) => ({
      id: log.id,
      checkedAt: log.created_at,
      location: null, // checkin_logs에 location 필드가 없으면 null
      type: null, // checkin_logs에 type 필드가 없으면 null
      method: log.source || null, // source를 method로 매핑
      staffEmail: log.scanned_by || null,
      staffName: log.scanned_by || null, // scanned_by에 이름이 포함되어 있을 수 있음
      source: log.source || null,
      isDuplicate: log.is_duplicate || null,
      note: log.note || null,
    })) || [];

  // 10) Change Logs 구성
  const changeLogsData: ParticipantInfoCenterData['changeLogs'] = participantChangeLogs.map((log) => {
    const metadata = log.metadata as any;
    const changes = metadata?.changes || [];
    
    // changes 배열의 각 항목을 개별 change log로 변환
    return changes.map((change: any, index: number) => ({
      id: `${log.id}-${index}`,
      changedAt: log.created_at,
      field: change.field || '',
      label: change.field || null,
      beforeValue: change.before ? String(change.before) : null,
      afterValue: change.after ? String(change.after) : null,
      changedByEmail: log.actor || null,
      changedByName: log.actor || null,
      source: 'admin', // operation_logs는 주로 admin에서 생성
    }));
  }).flat();

  return {
    basic,
    travel,
    hotel,
    internalNotes,
    checkInLogs: checkInLogsData,
    changeLogs: changeLogsData,
  };
}

