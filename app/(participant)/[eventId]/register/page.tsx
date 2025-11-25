import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RegistrationProgress from '@/components/participant/RegistrationProgress';
import BasicInfoForm from '@/components/participant/BasicInfoForm';
import PassportForm from '@/components/participant/PassportForm';
import { BasicInfo, PageProps } from '@/lib/types';

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

  const initialBasicInfo: BasicInfo = {
    name: participantData.name ?? '',
    email: participantData.email ?? '',
    phone: participantData.phone ?? '',
    company: participantData.company ?? '',
    position: participantData.position ?? '',
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
              passport_number: participantData.passport_number ?? '',
              passport_expiry: participantData.passport_expiry ?? '',
              visa_required: participantData.visa_required ?? false,
            }}
          />
        );
      case 'flight':
      case 'hotel':
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

