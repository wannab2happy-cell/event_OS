'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveHotelData } from '@/actions/participant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface HotelFormProps {
  eventId: string;
  participantId: string;
  initialData: {
    hotel_check_in?: string | null;
    hotel_check_out?: string | null;
    room_preference?: 'single' | 'twin' | null;
    sharing_details?: string | null;
  };
  onSaveSuccess?: () => void;
}

export default function HotelForm({
  eventId,
  participantId,
  initialData,
  onSaveSuccess,
}: HotelFormProps) {
  const [formData, setFormData] = useState({
    hotel_check_in: initialData.hotel_check_in || '',
    hotel_check_out: initialData.hotel_check_out || '',
    room_preference: initialData.room_preference || 'single',
    sharing_details: initialData.sharing_details || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value ?? '' });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const result = await saveHotelData(eventId, participantId, {
      hotel_check_in: formData.hotel_check_in,
      hotel_check_out: formData.hotel_check_out,
      room_preference: formData.room_preference as 'single' | 'twin',
      sharing_details: formData.sharing_details,
    });

    setLoading(false);

    if (result.success) {
      onSaveSuccess?.();
      router.refresh();
      router.push(`/${eventId}/qr-pass`);
    } else {
      setError(result.message);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>호텔 및 숙박 정보</CardTitle>
        <CardDescription>체크인/아웃 일정과 객실 선호도를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="호텔 체크인 날짜"
              name="hotel_check_in"
              type="date"
              value={formData.hotel_check_in}
              onChange={handleChange}
              required
            />
            <Input
              label="호텔 체크아웃 날짜"
              name="hotel_check_out"
              type="date"
              value={formData.hotel_check_out}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">객실 선호도</label>
            <select
              name="room_preference"
              value={formData.room_preference}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="single">싱글룸 (1인)</option>
              <option value="twin">트윈룸 (2인)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="sharing_details" className="block text-sm font-medium text-gray-700">
              기타 요청사항 / 룸 쉐어 정보
            </label>
            <textarea
              id="sharing_details"
              name="sharing_details"
              rows={3}
              value={formData.sharing_details}
              onChange={handleChange}
              placeholder="예: 금연 객실, 고층 요청, A 참가자와 룸쉐어 등"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium border-l-2 border-red-500 pl-3">
              저장 오류: {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
            {loading ? '정보 저장 중...' : '정보 등록 완료하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

