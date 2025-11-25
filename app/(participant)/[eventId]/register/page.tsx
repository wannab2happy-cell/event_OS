import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RegistrationProgress from '@/components/participant/RegistrationProgress';
import BasicInfoForm from '@/components/participant/BasicInfoForm';
import PassportForm from '@/components/participant/PassportForm';
import TravelForm from '@/components/participant/TravelForm';
import HotelForm from '@/components/participant/HotelForm';
import { BasicInfo, PageProps, Participant } from '@/lib/types';

const DEV_PARTICIPANT_ID = '997b69c7-2c97-4043-a6d1-4d1646700001';

export default async function RegistrationPage({ params, searchParams }: PageProps) {
  const eventId = params.eventId as string;
  const currentStepSlug = (searchParams?.step as string) || 'basic-info';
  const participantId = DEV_PARTICIPANT_ID;

  if (!eventId || !participantId) {
    return notFound();
  }

  const [{ data: eventData }, { data: participantData }] = await Promise.all([
    supabase.from('events').select('title').eq('id', eventId).single(),
    supabase.from('event_participants').select('*').eq('id', participantId).eq('event_id', eventId).single(),
  ]);

  if (!eventData || !participantData) {
    return notFound();
  }

  const participant = participantData as Participant;

  const initialBasicInfo: BasicInfo = {
    name: participant.name ?? '',
    email: participant.email ?? '',
    phone: participant.phone ?? '',
    company: participant.company ?? '',
    position: participant.position ?? '',
  };

  const renderStepComponent = (slug: string) => {
    switch (slug) {
      case 'basic-info':
        return <BasicInfoForm eventId={eventId} participantId={participantId} initialData={initialBasicInfo} />;
      case 'passport':
        return (
          <PassportForm
            eventId={eventId}
            participantId={participantId}
            initialData={{
              passport_number: participant.passport_number ?? '',
              passport_expiry: participant.passport_expiry ?? '',
              visa_required: participant.visa_required ?? false,
            }}
          />
        );
      case 'flight':
        return (
          <TravelForm
            eventId={eventId}
            participantId={participantId}
            initialData={{
              gender: participant.gender ?? undefined,
              dob: participant.dob ?? undefined,
              seat_preference: participant.seat_preference ?? undefined,
              arrival_date: participant.arrival_date ?? undefined,
              arrival_time: participant.arrival_time ?? undefined,
              arrival_airport: participant.arrival_airport ?? undefined,
              arrival_flight: participant.arrival_flight ?? undefined,
              departure_date: participant.departure_date ?? undefined,
              departure_time: participant.departure_time ?? undefined,
              departure_airport: participant.departure_airport ?? undefined,
              departure_flight: participant.departure_flight ?? undefined,
            }}
          />
        );
      case 'hotel':
        return (
          <HotelForm
            eventId={eventId}
            participantId={participantId}
            initialData={{
              hotel_check_in: participant.hotel_check_in ?? undefined,
              hotel_check_out: participant.hotel_check_out ?? undefined,
              room_preference: participant.room_preference ?? undefined,
              sharing_details: participant.sharing_details ?? undefined,
            }}
          />
        );
      case 'requests':
      case 'companions':
        return (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-md">
            <p className="text-xl font-semibold mb-2">&quot;{slug}&quot; 폼 준비 중</p>
            <p className="text-sm">다음 단계로 이동하기 전, 이 단계의 데이터를 저장하세요.</p>
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

