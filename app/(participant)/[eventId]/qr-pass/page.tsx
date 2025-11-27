import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QrCode, CheckCircle, Plane, Hotel, Calendar, MapPin, Clock } from 'lucide-react';
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

  // 항공 확정 정보
  const hasTravelInfo = participant.is_travel_confirmed && participant.flight_ticket_no;
  const hasArrivalInfo = participant.arrival_date && participant.arrival_flight;
  const hasDepartureInfo = participant.departure_date && participant.departure_flight;

  // 호텔 확정 정보
  const hasHotelInfo = participant.is_hotel_confirmed && participant.guest_confirmation_no;
  const hasHotelDates = participant.hotel_check_in && participant.hotel_check_out;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-1 text-gray-900">현장 체크인 PASS</h1>
      <p className="text-gray-500 mb-8">행사 당일, 이 페이지를 보여주세요.</p>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center shadow-2xl border-2 border-gray-100">
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

        {/* 항공 확정 정보 */}
        {hasTravelInfo && (
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center text-xl text-blue-700">
                <Plane className="w-5 h-5 mr-2" />
                항공 예약 확정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-green-800">항공권 번호</span>
                  <span className="text-lg font-bold text-green-900">{participant.flight_ticket_no}</span>
                </div>
              </div>

              {hasArrivalInfo && (
                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  <div className="flex items-center text-blue-700 font-semibold mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    도착 정보
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">{participant.arrival_date}</span>
                      {participant.arrival_time && (
                        <span className="ml-2 text-gray-600">{participant.arrival_time}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{participant.arrival_airport}</span>
                    </div>
                    <div className="flex items-center">
                      <Plane className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">항공편: {participant.arrival_flight}</span>
                    </div>
                  </div>
                </div>
              )}

              {hasDepartureInfo && (
                <div className="border-l-4 border-orange-500 pl-4 space-y-2">
                  <div className="flex items-center text-orange-700 font-semibold mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    출발 정보
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">{participant.departure_date}</span>
                      {participant.departure_time && (
                        <span className="ml-2 text-gray-600">{participant.departure_time}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{participant.departure_airport}</span>
                    </div>
                    <div className="flex items-center">
                      <Plane className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">항공편: {participant.departure_flight}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 호텔 확정 정보 */}
        {hasHotelInfo && (
          <Card className="shadow-lg border-2 border-purple-100">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center text-xl text-purple-700">
                <Hotel className="w-5 h-5 mr-2" />
                호텔 예약 확정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-green-800">예약 확인 번호</span>
                  <span className="text-lg font-bold text-green-900">{participant.guest_confirmation_no}</span>
                </div>
              </div>

              {hasHotelDates && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center text-blue-700 font-semibold mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      체크인
                    </div>
                    <p className="text-lg font-medium">{participant.hotel_check_in}</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center text-orange-700 font-semibold mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      체크아웃
                    </div>
                    <p className="text-lg font-medium">{participant.hotel_check_out}</p>
                  </div>
                </div>
              )}

              {participant.room_preference && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">객실 타입:</span> {participant.room_preference === 'single' ? '싱글' : '트윈'}
                </div>
              )}

              {participant.num_nights && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">숙박 일수:</span> {participant.num_nights}박
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

