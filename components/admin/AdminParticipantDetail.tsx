'use client';

import { useState, useTransition } from 'react';
import { Plane, Hotel, Save, CheckCircle, QrCode } from 'lucide-react';
import { Participant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateParticipantConfirmation } from '@/lib/adminActions';

interface AdminParticipantDetailProps {
  participant: Participant;
  eventId: string;
  eventTitle: string;
}

export function AdminParticipantDetail({ participant, eventId, eventTitle }: AdminParticipantDetailProps) {
  const [adminData, setAdminData] = useState({
    flight_ticket_no: participant.flight_ticket_no ?? '',
    guest_confirmation_no: participant.guest_confirmation_no ?? '',
    is_travel_confirmed: participant.is_travel_confirmed ?? false,
    is_hotel_confirmed: participant.is_hotel_confirmed ?? false,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAdminData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateParticipantConfirmation(eventId, participant.id, {
        ...adminData,
        participantEmail: participant.email,
        eventName: eventTitle,
      });
      setStatusMessage(result.message);
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-blue-200 border-2 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center text-blue-800">
              <CheckCircle className="w-5 h-5 mr-2" />
              예약 확정 및 발송
            </CardTitle>
            <CardDescription>확정 번호 입력 후 상태를 변경하면 참가자에게 안내 메일이 발송됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Input
              label="항공권 발권 번호"
              name="flight_ticket_no"
              value={adminData.flight_ticket_no}
              onChange={handleChange}
              placeholder="Admin 입력"
            />
            <Input
              label="호텔 Guest Confirmation No"
              name="guest_confirmation_no"
              value={adminData.guest_confirmation_no}
              onChange={handleChange}
              placeholder="Admin 입력"
            />
            <div className="space-y-2 pt-2 border-t mt-4">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 select-none">
                <input
                  id="travel_confirmed"
                  name="is_travel_confirmed"
                  type="checkbox"
                  checked={adminData.is_travel_confirmed}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <span className="flex items-center">
                  <Plane className="w-4 h-4 mr-1" /> 항공 예약 확정
                </span>
              </label>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 select-none">
                <input
                  id="hotel_confirmed"
                  name="is_hotel_confirmed"
                  type="checkbox"
                  checked={adminData.is_hotel_confirmed}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <span className="flex items-center">
                  <Hotel className="w-4 h-4 mr-1" /> 호텔 예약 확정
                </span>
              </label>
            </div>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg mt-4"
            >
              <Save className="w-5 h-5 mr-2" />
              {isPending ? '저장 중...' : '확정 및 정보 저장'}
            </Button>
            {statusMessage && <p className="text-xs text-green-700 pt-2">{statusMessage}</p>}
            <p className="text-xs text-center text-red-500 pt-2">
              확정 시 참가자에게 이메일 알림이 발송됩니다.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>이름:</strong> {participant.name}
              </p>
              <p>
                <strong>이메일:</strong> {participant.email}
              </p>
              <p>
                <strong>소속/직함:</strong> {participant.company ?? '-'} / {participant.position ?? '-'}
              </p>
              <p>
                <strong>전화:</strong> {participant.phone ?? '-'}
              </p>
              <a
                href={`/${eventId}/qr-pass`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <QrCode className="w-4 h-4 mr-1" />
                참가자 QR PASS 보기
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="w-5 h-5 mr-2" />
                항공/여행 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <strong>여권 번호:</strong> {participant.passport_number || 'N/A'}
              </div>
              <div>
                <strong>여권 만료일:</strong> {participant.passport_expiry || 'N/A'}
              </div>
              <div>
                <strong>성별/생년월일:</strong> {participant.gender || '-'} / {participant.dob || 'N/A'}
              </div>
              <div>
                <strong>비자 필요:</strong> {participant.visa_required ? 'YES' : 'No'}
              </div>

              <div className="col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-base mb-1">
                  도착: {participant.arrival_airport || '-'} ({participant.arrival_flight || '-'})
                </h4>
                <p>
                  날짜/시간: {participant.arrival_date || '-'} {participant.arrival_time || ''}
                </p>
              </div>
              <div className="col-span-2 border-t pt-2 mt-2">
                <h4 className="font-semibold text-base mb-1">
                  출발: {participant.departure_airport || '-'} ({participant.departure_flight || '-'})
                </h4>
                <p>
                  날짜/시간: {participant.departure_date || '-'} {participant.departure_time || ''}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hotel className="w-5 h-5 mr-2" />
                호텔/숙박 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>체크인/아웃:</strong> {participant.hotel_check_in || '-'} ~{' '}
                {participant.hotel_check_out || '-'}
              </p>
              <p>
                <strong>객실 선호도:</strong> {participant.room_preference?.toUpperCase() || '-'}
              </p>
              <p>
                <strong>기타 요청/쉐어:</strong> {participant.sharing_details || '없음'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

