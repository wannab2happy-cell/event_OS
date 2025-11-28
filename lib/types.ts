export type UUID = string;

export interface EventBranding {
  primary_color: string;
  secondary_color: string;
  kv_image_url: string;
  logo_image_url: string;
  accent_color?: string;
  font_family?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface Event {
  id: UUID;
  title: string;
  code: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'archived';
  schedule?: ScheduleItem[] | null;
  hero_tagline?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_latitude?: number | null;
  venue_longitude?: number | null;
  location_name?: string | null;
  location_detail?: string | null;
}

export type ParticipantStatus = 'invited' | 'registered' | 'completed' | 'checked_in';

export interface Participant {
  id: UUID;
  event_id: UUID;
  email: string;
  name: string;
  phone: string;
  company: string | null;
  position: string | null;
  status: ParticipantStatus;
  created_at: string;
  updated_at: string;
  passport_number: string | null;
  passport_expiry: string | null;
  visa_required: boolean;
  gender: 'male' | 'female' | null;
  dob: string | null;
  seat_preference: string | null;
  companion_status: 'none' | 'adult' | 'kids' | null;
  companion_details: string | null;
  flight_issue_date: string | null;
  flight_reservation_no: string | null;
  flight_ticket_no: string | null;
  arrival_date: string | null;
  arrival_time: string | null;
  arrival_airport: string | null;
  arrival_flight: string | null;
  departure_date: string | null;
  departure_time: string | null;
  departure_airport: string | null;
  departure_flight: string | null;
  hotel_check_in: string | null;
  hotel_check_out: string | null;
  room_preference: 'single' | 'twin' | null;
  sharing_details: string | null;
  guest_confirmation_no: string | null;
  membership_no: string | null;
  num_nights: number | null;
  num_rooms: number | null;
  num_adults: number | null;
  is_travel_confirmed: boolean;
  is_hotel_confirmed: boolean;
  vip_level?: number | null;
  guest_of?: UUID | null;
  vip_note?: string | null;
  is_checked_in?: boolean | null;
  checked_in_at?: string | null;
}

export interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
}

export interface PassportData {
  passport_number: string;
  passport_expiry: string;
  visa_required: boolean;
}

export interface TravelDataExtended {
  gender: 'male' | 'female';
  dob: string;
  seat_preference: string;
  arrival_date: string;
  arrival_time: string;
  arrival_airport: string;
  arrival_flight: string;
  departure_date: string;
  departure_time: string;
  departure_airport: string;
  departure_flight: string;
}

export interface HotelDataExtended {
  hotel_check_in: string;
  hotel_check_out: string;
  room_preference: 'single' | 'twin';
  sharing_details: string;
}

export interface AdminNotification {
  id: UUID;
  event_id: UUID;
  participant_id: UUID | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Participant Portal Summary Types
export type ParticipantStatusSummary = {
  status: 'invited' | 'registered' | 'completed' | 'checked_in';
  statusLabel: string;
  isVip: boolean;
  vipLevel: number | null;
  vipLabel: string | null;
  tableName: string | null;
  seatNumber: number | null;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  guestOfName: string | null;
};

export type ParticipantTravelSummary = {
  hasTravel: boolean;
  departureCity: string | null;
  arrivalCity: string | null;
  arrivalFlight: string | null;
  departureFlight: string | null;
  flightNumber: string | null;
  departureDate: string | null;
  arrivalDate: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  isTravelConfirmed: boolean;
  flightTicketNo: string | null;
  travelStatusLabel: string;
};

export type ParticipantHotelSummary = {
  hasHotel: boolean;
  hotelName: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  roomType: string | null;
  isConfirmed: boolean | null;
  guestConfirmationNo: string | null;
  hotelStatusLabel: string;
};

// Table Assignment Types
export interface TableAssignment {
  id: UUID;
  event_id: UUID;
  table_id: UUID;
  participant_id: UUID;
  seat_number: number | null;
  is_draft?: boolean | null;
  source?: string | null;
  batch_id?: string | null;
  assigned_by?: string | null;
  assigned_at?: string | null;
  created_at?: string;
}

export interface Table {
  id: UUID;
  event_id: UUID;
  name: string;
  capacity: number;
  sort_order: number;
  is_vip_table?: boolean | null;
  tags?: string[] | null;
  created_at?: string;
}

export interface TableSummary {
  totalParticipants: number;
  tableCount: number;
  assignedCount: number;
  unassignedCount: number;
  draftCount?: number;
  confirmedCount?: number;
}

// Participant Info Center Types
export interface TableInfo {
  id: string;
  name: string;
  sort_order?: number | null;
}

export interface ParticipantExtended {
  participant: Participant;
  table: TableInfo | null;
  vip_level: number | null;
  guest_of_name?: string | null;
  is_checked_in?: boolean | null;
  checked_in_at?: string | null;
  travel?: {
    arrival_airport?: string | null;
    arrival_flight_no?: string | null;
    departure_airport?: string | null;
    departure_flight_no?: string | null;
    is_travel_confirmed?: boolean | null;
  } | null;
  hotel?: {
    hotel_name?: string | null;
    check_in_date?: string | null;
    check_out_date?: string | null;
    room_type?: string | null;
    is_hotel_confirmed?: boolean | null;
  } | null;
}

// Helper functions
export function mapStatusToLabel(status: string): string {
  const statusMap: Record<string, string> = {
    invited: '초대됨',
    registered: '등록 중',
    completed: '등록 완료',
    checked_in: '체크인 완료',
  };
  return statusMap[status] || status;
}

export function mapVipLevelToLabel(level: number | null | undefined): string {
  if (!level || level === 0) return '';
  return `VIP ${level}`;
}

// Participant Info Center Types
export interface ParticipantInfoCenterData {
  basic: {
    id: string;
    eventId: string;
    name: string;
    email: string;
    company?: string | null;
    position?: string | null;
    phone?: string | null;
    mobile_phone?: string | null;
    country?: string | null;
    status: ParticipantStatus;
    created_at: string;
    updated_at: string;
    vip_level?: number | null;
    guest_of?: string | null;
    guest_of_name?: string | null;
    tableName?: string | null;
    isCheckedIn?: boolean | null;
  };
  travel: {
    departure_airport?: string | null;
    arrival_airport?: string | null;
    departure_date?: string | null;
    return_date?: string | null;
    departure_time?: string | null;
    arrival_time?: string | null;
    flight_number_go?: string | null;
    flight_number_return?: string | null;
    passport_name?: string | null;
    passport_number?: string | null;
    passport_expiry?: string | null;
    special_request?: string | null;
    is_travel_confirmed?: boolean | null;
  };
  hotel: {
    hotel_name?: string | null;
    room_type?: string | null;
    check_in_date?: string | null;
    check_out_date?: string | null;
    nights?: number | null;
    confirmation_number?: string | null;
    roommate_name?: string | null;
    smoking_preference?: string | null;
    is_hotel_confirmed?: boolean | null;
  };
  internalNotes: {
    id: string;
    createdAt: string;
    updatedAt?: string | null;
    authorEmail?: string | null;
    authorName?: string | null;
    content: string;
    isPinned?: boolean;
  }[];
  checkInLogs: {
    id: string;
    checkedAt: string;
    location?: string | null;
    type?: string | null;
    method?: string | null;
    staffEmail?: string | null;
    staffName?: string | null;
    source?: string | null;
    isDuplicate?: boolean | null;
    note?: string | null;
  }[];
  changeLogs: {
    id: string;
    changedAt: string;
    field: string;
    label?: string | null;
    beforeValue?: string | null;
    afterValue?: string | null;
    changedByEmail?: string | null;
    changedByName?: string | null;
    source?: string | null;
  }[];
}

