export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertParticipantAuth } from '@/lib/participantAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ParticipantPortalClient from '@/components/participant/ParticipantPortalClient';
import type { Participant, ParticipantStatusSummary, ParticipantTravelSummary, ParticipantHotelSummary } from '@/lib/types';

type ParticipantPortalPageProps = {
  params: Promise<{ eventId?: string }>;
};

// 헬퍼 함수들
function mapStatusToLabel(status: string): string {
  const statusMap: Record<string, string> = {
    invited: '초대됨',
    registered: '등록 진행중',
    completed: '등록 완료',
    checked_in: '체크인 완료',
  };
  return statusMap[status] || status;
}

function mapVipLevelToLabel(vipLevel: number | null): string | null {
  if (!vipLevel || vipLevel === 0) return null;
  return `VIP Lv.${vipLevel}`;
}

function mapTravelStatus(participant: Participant): string {
  const hasTravel = !!(
    participant.departure_airport ||
    participant.arrival_airport ||
    participant.arrival_flight ||
    participant.departure_flight
  );

  if (!hasTravel) {
    return '미입력';
  }

  if (participant.is_travel_confirmed) {
    return '확정됨';
  }

  return '정보 등록됨';
}

function mapHotelStatus(participant: Participant): string {
  const hasHotel = !!(
    participant.hotel_check_in ||
    participant.hotel_check_out ||
    participant.guest_confirmation_no
  );

  if (!hasHotel) {
    return '미배정';
  }

  if (participant.is_hotel_confirmed) {
    return '확정됨';
  }

  return '임시 배정';
}

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code, start_date, end_date, venue_name, venue_address, primary_color')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchTableInfo(eventId: string, participantId: string) {
  const { data: assignment } = await supabaseAdmin
    .from('table_assignments')
    .select('table_id, seat_number')
    .eq('event_id', eventId)
    .eq('participant_id', participantId)
    .maybeSingle();

  if (!assignment) {
    return {
      tableName: null,
      seatNumber: null,
    };
  }

  // 테이블 정보 조회
  const { data: table } = await supabaseAdmin
    .from('tables')
    .select('name')
    .eq('id', assignment.table_id)
    .single();

  return {
    tableName: table?.name || null,
    seatNumber: assignment.seat_number || null,
  };
}

async function fetchGuestOfInfo(guestOfId: string | null) {
  if (!guestOfId) return null;

  const { data } = await supabaseAdmin
    .from('event_participants')
    .select('name')
    .eq('id', guestOfId)
    .single();

  return data?.name || null;
}

export default async function ParticipantPortalPage({ params }: ParticipantPortalPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // 참가자 인증 체크
  const { participant } = await assertParticipantAuth(eventId);

  // 이벤트 정보 로드
  const event = await fetchEvent(eventId);
  if (!event) {
    return notFound();
  }

  // 테이블 정보 로드
  const tableInfo = await fetchTableInfo(eventId, participant.id);

  // Guest Of 정보 로드
  const guestOfName = await fetchGuestOfInfo(participant.guest_of || null);

  // Status Summary 구성
  const statusSummary: ParticipantStatusSummary = {
    status: participant.status,
    statusLabel: mapStatusToLabel(participant.status),
    isVip: (participant.vip_level ?? 0) > 0,
    vipLevel: participant.vip_level ?? null,
    vipLabel: mapVipLevelToLabel(participant.vip_level),
    tableName: tableInfo.tableName,
    seatNumber: tableInfo.seatNumber,
    isCheckedIn: !!participant.is_checked_in,
    checkedInAt: participant.checked_in_at || null,
    guestOfName,
  };

  // Travel Summary 구성
  const travelSummary: ParticipantTravelSummary = {
    hasTravel: !!(
      participant.departure_airport ||
      participant.arrival_airport ||
      participant.arrival_flight ||
      participant.departure_flight
    ),
    departureCity: participant.departure_airport || null,
    arrivalCity: participant.arrival_airport || null,
    arrivalFlight: participant.arrival_flight || null,
    departureFlight: participant.departure_flight || null,
    flightNumber: participant.arrival_flight || participant.departure_flight || null,
    departureDate: participant.departure_date || null,
    arrivalDate: participant.arrival_date || null,
    departureTime: participant.departure_time || null,
    arrivalTime: participant.arrival_time || null,
    isTravelConfirmed: participant.is_travel_confirmed || false,
    flightTicketNo: participant.flight_ticket_no || null,
    travelStatusLabel: mapTravelStatus(participant),
  };

  // Hotel Summary 구성
  const hotelSummary: ParticipantHotelSummary = {
    hasHotel: !!(
      participant.hotel_check_in ||
      participant.hotel_check_out ||
      participant.guest_confirmation_no
    ),
    hotelName: null, // event_participants에 hotel_name 필드가 없으면 null
    checkInDate: participant.hotel_check_in || null,
    checkOutDate: participant.hotel_check_out || null,
    roomType: participant.room_preference || null,
    isConfirmed: participant.is_hotel_confirmed || null,
    guestConfirmationNo: participant.guest_confirmation_no || null,
    hotelStatusLabel: mapHotelStatus(participant),
  };

  return (
    <ParticipantPortalClient
      event={event}
      participant={participant}
      statusSummary={statusSummary}
      travelSummary={travelSummary}
      hotelSummary={hotelSummary}
    />
  );
}
