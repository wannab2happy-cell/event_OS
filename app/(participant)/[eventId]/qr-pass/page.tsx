'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Qrcode, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Participant, PageProps } from '@/lib/types';
import { generateQrContent } from '@/lib/qr';

const DEV_PARTICIPANT_ID = '997b69c7-2c97-4043-a6d1-4d1646700001';

const QRCodeDisplay = ({ value }: { value: string }) => (
  <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-inner">
    <div className="w-48 h-48 bg-gray-900 flex items-center justify-center text-white text-xs rounded-lg p-2 text-center">
      QR CODE
      <br />
      {value.substring(0, 30)}...
    </div>
  </div>
);

export default function QrPassPage({ params }: PageProps) {
  const eventId = params.eventId as string;
  const supabase = createClientComponentClient();
  const participantId = DEV_PARTICIPANT_ID;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qrContent = participantId ? generateQrContent(eventId, participantId) : '';

  useEffect(() => {
    async function fetchParticipant() {
      if (!participantId) {
        setError('참가자 정보를 찾을 수 없습니다. 로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('event_participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (fetchError || !data) {
        setError('참가자 정보를 불러오는 데 실패했습니다.');
      } else {
        setParticipant(data as Participant);
      }
      setLoading(false);
    }

    fetchParticipant();
  }, [participantId, supabase]);

  if (loading) return <div className="text-center p-10">참가증을 준비 중입니다...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!participant) return <div className="text-center p-10">유효한 참가자가 아닙니다.</div>;

  const isComplete = participant.status === 'completed';

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-1 text-gray-900">현장 체크인 PASS</h1>
      <p className="text-gray-500 mb-8">행사 당일, 이 페이지를 보여주세요.</p>

      <Card className="max-w-md mx-auto text-center shadow-2xl border-2 border-gray-100">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex justify-center items-center text-2xl text-blue-600">
            <Qrcode className="w-6 h-6 mr-2" />
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

