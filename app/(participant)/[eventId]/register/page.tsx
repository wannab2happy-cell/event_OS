export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import RegistrationProgress from '@/components/participant/RegistrationProgress';
import BasicInfoForm from '@/components/participant/BasicInfoForm';
import PassportForm from '@/components/participant/PassportForm';
import TravelForm from '@/components/participant/TravelForm';
import HotelForm from '@/components/participant/HotelForm';
import { BasicInfo, Participant } from '@/lib/types';

type RegistrationPageProps = {
  params: Promise<{ eventId?: string }>;
  searchParams?: Promise<{ step?: string }>;
};

export default async function RegistrationPage({ params, searchParams }: RegistrationPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const eventId = resolvedParams?.eventId;
  const stepParam = resolvedSearch?.step;
  const currentStepSlug = typeof stepParam === 'string' ? stepParam : 'basic-info';

  if (!eventId) {
    return notFound();
  }

  const supabaseServer = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user?.email) {
    return redirect(`/${eventId}/login`);
  }

  const userEmail = session.user.email;

  const { data: participantData, error: participantError } = await supabaseServer
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('email', userEmail)
    .single();

  if (participantError || !participantData) {
    console.error('Participant data fetch failed:', participantError?.message);
    return notFound();
  }

  const participant = participantData as Participant;
  const participantId = participant.id;

  const { data: eventData, error: eventError } = await supabaseServer
    .from('events')
    .select('title')
    .eq('id', eventId)
    .single();

  if (eventError || !eventData) {
    return notFound();
  }

  const initialBasicInfo: BasicInfo = {
    name: participant.name ?? '',
    email: participant.email ?? '',
    phone: participant.phone ?? '',
    company: participant.company ?? undefined,
    position: participant.position ?? undefined,
  };

  const initialPassportInfo = {
    passport_number: participant.passport_number ?? '',
    passport_expiry: participant.passport_expiry ?? '',
    visa_required: participant.visa_required ?? false,
  };

  const initialTravelInfo = {
    gender: participant.gender ?? 'male',
    dob: participant.dob ?? '',
    seat_preference: participant.seat_preference ?? '',
    arrival_date: participant.arrival_date ?? '',
    arrival_time: participant.arrival_time ?? '',
    arrival_airport: participant.arrival_airport ?? '',
    arrival_flight: participant.arrival_flight ?? '',
    departure_date: participant.departure_date ?? '',
    departure_time: participant.departure_time ?? '',
    departure_airport: participant.departure_airport ?? '',
    departure_flight: participant.departure_flight ?? '',
  };

  const initialHotelInfo = {
    hotel_check_in: participant.hotel_check_in ?? '',
    hotel_check_out: participant.hotel_check_out ?? '',
    room_preference: participant.room_preference ?? 'single',
    sharing_details: participant.sharing_details ?? '',
  };

  const renderStepComponent = (slug: string) => {
    switch (slug) {
      case 'basic-info':
        return (
          <BasicInfoForm
            eventId={eventId}
            participantId={participantId}
            initialData={initialBasicInfo}
          />
        );
      case 'passport':
        return (
          <PassportForm
            eventId={eventId}
            participantId={participantId}
            initialData={initialPassportInfo}
          />
        );
      case 'flight':
        return (
          <TravelForm
            eventId={eventId}
            participantId={participantId}
            initialData={initialTravelInfo}
          />
        );
      case 'hotel':
        return (
          <HotelForm
            eventId={eventId}
            participantId={participantId}
            initialData={initialHotelInfo}
          />
        );
      case 'requests':
      case 'companions':
        return (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-md">
            <p className="text-xl font-semibold mb-2">&quot;{currentStepSlug}&quot; 섹션</p>
            <p className="text-sm">나머지 정보는 호텔/항공 폼에 통합되었습니다. QR PASS 페이지로 이동하세요.</p>
            <a
              href={`/${eventId}/qr-pass`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              QR PASS 확인하기
            </a>
          </div>
        );
      default:
        redirect(`/${eventId}/register?step=basic-info`);
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-12 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">{eventData.title}</h1>
        <p className="text-gray-500">참가 정보 입력 및 수정</p>
      </div>
      <RegistrationProgress eventId={eventId} currentStepSlug={currentStepSlug} />
      {renderStepComponent(currentStepSlug)}
    </main>
  );
}

