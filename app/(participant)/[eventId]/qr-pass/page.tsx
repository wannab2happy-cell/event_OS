import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QrCode, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Participant } from '@/lib/types';
import { generateQrContent } from '@/lib/qr';

type QrPassPageProps = {
  params: Promise<{ eventId?: string }>;
};

const QRCodeDisplay = ({ value }: { value: string }) => (
  <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-inner">
    <div className="w-48 h-48 bg-gray-900 flex items-center justify-center text-white text-xs rounded-lg p-2 text-center">
      QR CODE
      <br />
      {value.substring(0, 30)}...
    </div>
  </div>
);

export default async function QrPassPage({ params }: QrPassPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

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
    return notFound();
  }

  const participant = participantData as Participant;
  const qrContent = generateQrContent(eventId, participant.id);
  const isComplete = participant.status === 'completed';

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-1 text-gray-900">현장 체크인 PASS</h1>
      <p className="text-gray-500 mb-8">행사 당일, 이 페이지를 보여주세요.</p>

      <Card className="max-w-md mx-auto text-center shadow-2xl border-2 border-gray-100">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex justify-center items-center text-2xl text-blue-600">
            <QrCode className="w-6 h-6 mr-2" />
            {participant.name} 님의 패스
          </CardTitle>
          <CardDescription>Event: {eventId.slice(0, 8).toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <QRCodeDisplay value={qrContent} />

          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              {participant.name} ({participant.company || '소속 미입력'})
            </p>
            <p className="text-sm text-gray-500">{participant.email}</p>
          </div>

          <div
            className={`p-3 rounded-lg flex items-center justify-center ${
              isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {isComplete ? '참가 등록 완료 및 정보 완성' : '정보 입력 진행 중 (현장 체크인 가능)'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

