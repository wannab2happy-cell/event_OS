export type UUID = string;

export interface EventBranding {
  primary_color: string;
  secondary_color: string;
  kv_image_url: string;
  logo_image_url: string;
  accent_color?: string;
  font_family?: string;
}

export interface Event {
  id: UUID;
  title: string;
  code: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'archived';
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

