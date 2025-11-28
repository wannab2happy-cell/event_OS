export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import ParticipantCenterClient from '@/components/admin/ParticipantCenterClient';
import type { ParticipantExtended, TableInfo, Participant } from '@/lib/types';

type ParticipantCenterPageProps = {
  params: Promise<{ eventId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, code, title, start_date, end_date, venue_name')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchParticipantsExtended(eventId: string): Promise<ParticipantExtended[]> {
  // 1) 모든 참가자 조회
  const { data: participants, error: participantsError } = await supabaseAdmin
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('name', { ascending: true });

  if (participantsError) {
    console.error('Participants fetch error:', participantsError);
    return [];
  }

  if (!participants || participants.length === 0) {
    return [];
  }

  // 2) 확정된 테이블 배정 조회 (is_draft = false)
  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .from('table_assignments')
    .select('table_id, participant_id, seat_number, tables(id, name, sort_order)')
    .eq('event_id', eventId)
    .eq('is_draft', false);

  if (assignmentsError) {
    console.error('Assignments fetch error:', assignmentsError);
  }

  // 3) 테이블 정보 조회
  const { data: tables, error: tablesError } = await supabaseAdmin
    .from('tables')
    .select('id, name, sort_order')
    .eq('event_id', eventId);

  if (tablesError) {
    console.error('Tables fetch error:', tablesError);
  }

  // 4) guest_of 참가자 이름 조회
  const guestOfIds = participants
    .filter((p) => p.guest_of)
    .map((p) => p.guest_of)
    .filter((id): id is string => !!id);

  const guestOfMap = new Map<string, string>();
  if (guestOfIds.length > 0) {
    const { data: guestOfParticipants } = await supabaseAdmin
      .from('event_participants')
      .select('id, name')
      .eq('event_id', eventId)
      .in('id', guestOfIds);

    guestOfParticipants?.forEach((p) => {
      guestOfMap.set(p.id, p.name || '');
    });
  }

  // 5) 테이블 매핑 생성
  const tableMap = new Map<string, TableInfo>();
  tables?.forEach((table) => {
    tableMap.set(table.id, {
      id: table.id,
      name: table.name,
      sort_order: table.sort_order || null,
    });
  });

  // 6) 배정 매핑 생성 (participant_id -> table)
  const assignmentMap = new Map<string, { table: TableInfo; seatNumber: number | null }>();
  assignments?.forEach((assignment) => {
    const table = assignment.tables as any;
    if (table) {
      assignmentMap.set(assignment.participant_id, {
        table: {
          id: table.id,
          name: table.name,
          sort_order: table.sort_order || null,
        },
        seatNumber: assignment.seat_number,
      });
    }
  });

  // 7) ParticipantExtended 배열 생성
  const participantsExtended: ParticipantExtended[] = participants.map((participant) => {
    const assignment = assignmentMap.get(participant.id);
    const table = assignment?.table || null;
    const guestOfName = participant.guest_of ? guestOfMap.get(participant.guest_of) || null : null;

    // Travel 정보 구성
    const travel = participant.arrival_airport || participant.arrival_flight || participant.departure_airport || participant.departure_flight
      ? {
          arrival_airport: participant.arrival_airport || null,
          arrival_flight_no: participant.arrival_flight || null,
          departure_airport: participant.departure_airport || null,
          departure_flight_no: participant.departure_flight || null,
          is_travel_confirmed: participant.is_travel_confirmed || null,
        }
      : null;

    // Hotel 정보 구성 (hotel_name은 스키마에 없을 수 있으므로 null로 처리)
    const hotel = participant.hotel_check_in || participant.hotel_check_out || participant.guest_confirmation_no
      ? {
          hotel_name: null, // 스키마에 hotel_name 필드가 없으면 null
          check_in_date: participant.hotel_check_in || null,
          check_out_date: participant.hotel_check_out || null,
          room_type: participant.room_preference || null,
          is_hotel_confirmed: participant.is_hotel_confirmed || null,
        }
      : null;

    return {
      participant: participant as Participant,
      table,
      vip_level: participant.vip_level || null,
      guest_of_name: guestOfName || null,
      is_checked_in: participant.is_checked_in || null,
      checked_in_at: participant.checked_in_at || null,
      travel,
      hotel,
    };
  });

  return participantsExtended;
}

export default async function ParticipantCenterPage({ params }: ParticipantCenterPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, participantsExtended] = await Promise.all([
    fetchEvent(eventId),
    fetchParticipantsExtended(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Participant Info Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자 정보를 검색하고 편집하세요.
        </p>
      </div>

      {/* 클라이언트 컴포넌트 */}
      <ParticipantCenterClient event={event} participants={participantsExtended} />
    </div>
  );
}

