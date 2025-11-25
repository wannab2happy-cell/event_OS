export type Event = {
  id: string;
  code: string;
  title: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_detail?: string;
  hero_tagline?: string;
  is_public: boolean;
};

export type Branding = {
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  logo_url?: string;
  kv_image_url?: string;
  font_family?: string;
};

export type Participant = {
  id: string;
  event_id: string;
  email: string;
  name: string;
  company?: string;
  position?: string;
  phone?: string;
  passport_number?: string;
  passport_expiry?: string;
  visa_required?: boolean;
  status: 'invited' | 'registered' | 'completed' | 'cancelled';
};

export type BasicInfo = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
};

export type EventBranding = {
  primary_color: string;
  secondary_color: string;
  kv_image_url?: string;
  logo_image_url?: string;
};

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

