export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { QrCode, CheckCircle, Plane, Hotel, Calendar, MapPin, Clock, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import QRCodeDisplay from '@/components/participant/QRCodeDisplay';
import PushNotificationRegister from '@/components/participant/PushNotificationRegister';
import type { Participant } from '@/lib/types';
import { generateQrContent } from '@/lib/qr';

type QrPassPageProps = {
  params: Promise<{ eventId?: string }>;
};

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
  
  // VIP 체크
  const isVIP = (participant as any).vip_level > 0;
  const vipLevel = (participant as any).vip_level || 0;

  // 항공 확정 정보
  const hasTravelInfo = participant.is_travel_confirmed && participant.flight_ticket_no;
  const hasArrivalInfo = participant.arrival_date && participant.arrival_flight;
  const hasDepartureInfo = participant.departure_date && participant.departure_flight;

  // 호텔 확정 정보
  const hasHotelInfo = participant.is_hotel_confirmed && participant.guest_confirmation_no;
  const hasHotelDates = participant.hotel_check_in && participant.hotel_check_out;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Push 알림 자동 등록 */}
      <PushNotificationRegister eventId={eventId} participantId={participant.id} />
      
      {/* 모바일 퍼스트: 작은 화면에서도 최적화 */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">
        {/* 헤더: 명확한 타이포그래피와 충분한 여백 */}
        <div className="mb-8 sm:mb-12 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            현장 체크인 PASS
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            행사 당일, 이 페이지를 보여주세요.
          </p>
        </div>

        {/* 메인 QR 카드: 고대비, 충분한 여백 */}
        <Card
          className={`text-center shadow-lg mb-6 sm:mb-8 ${
            isVIP
              ? 'border-2 border-[#FFD700] bg-gradient-to-br from-amber-50/50 to-yellow-50/50'
              : 'border border-gray-200'
          }`}
          style={
            isVIP
              ? {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                }
              : {}
          }
        >
          <CardHeader
            className={`border-b px-6 py-6 sm:px-8 sm:py-8 ${
              isVIP ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 'bg-white border-gray-100'
            }`}
          >
            {isVIP && (
              <div className="mb-3 flex justify-center">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#B8860B',
                  }}
                >
                  <Crown className="w-4 h-4" />
                  VIP Access
                </span>
              </div>
            )}
            <CardTitle
              className={`flex justify-center items-center text-xl sm:text-2xl font-bold mb-2 ${
                isVIP ? 'text-[#B8860B]' : 'text-gray-900'
              }`}
            >
              <QrCode
                className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${isVIP ? 'text-[#FFD700]' : 'text-blue-600'}`}
              />
              {participant.name} 님의 패스
            </CardTitle>
            <CardDescription className={`text-xs sm:text-sm mt-2 ${isVIP ? 'text-amber-700' : 'text-gray-500'}`}>
              Event: {eventId.slice(0, 8).toUpperCase()}
              {isVIP && ` • VIP Level ${vipLevel}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 sm:px-10 space-y-8">
            {/* QR 코드: 고대비, 충분한 크기 */}
            <QRCodeDisplay value={qrContent} />

            {/* 참가자 정보: 명확한 타이포그래피 */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <p className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                {participant.name}
              </p>
              {participant.company && (
                <p className="text-sm sm:text-base text-gray-600">
                  {participant.company}
                </p>
              )}
              <p className="text-xs sm:text-sm text-gray-500">{participant.email}</p>
            </div>

            {/* 상태 표시: 시스템 상태 가시성 (닐슨 원칙) */}
            <div
              className={`p-4 rounded-xl flex items-center justify-center border-2 ${
                isComplete
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
              role="status"
              aria-live="polite"
            >
              <CheckCircle
                className={`w-5 h-5 mr-2 flex-shrink-0 ${
                  isComplete ? 'text-green-600' : 'text-amber-600'
                }`}
              />
              <span className="text-sm sm:text-base font-medium text-center">
                {isComplete
                  ? '참가 등록 완료 및 정보 완성'
                  : '정보 입력 진행 중 (현장 체크인 가능)'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 항공 확정 정보: 모바일 최적화, 충분한 여백 */}
        {hasTravelInfo && (
          <Card className="shadow-md border border-blue-200 mb-6 sm:mb-8">
            <CardHeader className="bg-blue-50 border-b border-blue-100 px-6 py-5">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-blue-900">
                <Plane className="w-5 h-5 mr-2 flex-shrink-0" />
                항공 예약 확정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-5">
              {/* 항공권 번호: 고대비, 명확한 타이포그래피 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm sm:text-base font-semibold text-green-900">항공권 번호</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-900 tracking-tight">
                    {participant.flight_ticket_no}
                  </span>
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

        {/* 호텔 확정 정보: 모바일 최적화, 충분한 여백 */}
        {hasHotelInfo && (
          <Card className="shadow-md border border-purple-200 mb-6 sm:mb-8">
            <CardHeader className="bg-purple-50 border-b border-purple-100 px-6 py-5">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-purple-900">
                <Hotel className="w-5 h-5 mr-2 flex-shrink-0" />
                호텔 예약 확정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-5">
              {/* 예약 확인 번호: 고대비, 명확한 타이포그래피 */}
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm sm:text-base font-semibold text-green-900">예약 확인 번호</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-900 tracking-tight">
                    {participant.guest_confirmation_no}
                  </span>
                </div>
              </div>

              {hasHotelDates && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="border-l-4 border-blue-500 pl-5 py-3 bg-blue-50 rounded-r-lg">
                    <div className="flex items-center text-blue-900 font-semibold mb-2 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      체크인
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{participant.hotel_check_in}</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-5 py-3 bg-orange-50 rounded-r-lg">
                    <div className="flex items-center text-orange-900 font-semibold mb-2 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      체크아웃
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{participant.hotel_check_out}</p>
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

