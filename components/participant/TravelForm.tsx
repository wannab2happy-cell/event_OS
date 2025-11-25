'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveTravelData } from '@/actions/participant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TravelFormProps {
  eventId: string;
  participantId: string;
  initialData: {
    gender?: 'male' | 'female';
    dob?: string | null;
    seat_preference?: string | null;
    arrival_date?: string | null;
    arrival_time?: string | null;
    arrival_airport?: string | null;
    arrival_flight?: string | null;
    departure_date?: string | null;
    departure_time?: string | null;
    departure_airport?: string | null;
    departure_flight?: string | null;
  };
  onSaveSuccess?: () => void;
}

export default function TravelForm({
  eventId,
  participantId,
  initialData,
  onSaveSuccess,
}: TravelFormProps) {
  const [formData, setFormData] = useState({
    gender: initialData.gender || 'male',
    dob: initialData.dob || '',
    seat_preference: initialData.seat_preference || '',
    arrival_date: initialData.arrival_date || '',
    arrival_time: initialData.arrival_time || '',
    arrival_airport: initialData.arrival_airport || '',
    arrival_flight: initialData.arrival_flight || '',
    departure_date: initialData.departure_date || '',
    departure_time: initialData.departure_time || '',
    departure_airport: initialData.departure_airport || '',
    departure_flight: initialData.departure_flight || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value ?? '' });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await saveTravelData(eventId, participantId, {
      gender: formData.gender as 'male' | 'female',
      dob: formData.dob,
      seat_preference: formData.seat_preference,
      arrival_date: formData.arrival_date,
      arrival_time: formData.arrival_time,
      arrival_airport: formData.arrival_airport,
      arrival_flight: formData.arrival_flight,
      departure_date: formData.departure_date,
      departure_time: formData.departure_time,
      departure_airport: formData.departure_airport,
      departure_flight: formData.departure_flight,
    });

    setLoading(false);

    if (result.success) {
      onSaveSuccess?.();
      router.refresh();
      router.push(`/${eventId}/register?step=hotel`);
    } else {
      setError({ message: result.message });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>항공권 발권 정보</CardTitle>
        <CardDescription>발권에 필요한 여권 정보와 이동 일정을 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-semibold text-gray-700">개인 발권 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="생년월일"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">성별</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="male">남성 (Male)</option>
                <option value="female">여성 (Female)</option>
              </select>
            </div>
          </div>

          <Input
            label="선호 좌석 (예: 창가/복도, 선호 안함)"
            name="seat_preference"
            value={formData.seat_preference}
            onChange={handleChange}
            placeholder="Aisle (복도) 또는 Window (창가)"
          />

          <h3 className="font-semibold text-gray-700 pt-4">도착편 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="날짜" name="arrival_date" type="date" value={formData.arrival_date} onChange={handleChange} required />
            <Input label="시간" name="arrival_time" type="time" value={formData.arrival_time} onChange={handleChange} required />
            <Input label="출발공항" name="arrival_airport" value={formData.arrival_airport} onChange={handleChange} placeholder="ICN" required />
            <Input label="편명" name="arrival_flight" value={formData.arrival_flight} onChange={handleChange} placeholder="KE001" required />
          </div>

          <h3 className="font-semibold text-gray-700 pt-4">귀국편 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="날짜" name="departure_date" type="date" value={formData.departure_date} onChange={handleChange} required />
            <Input label="시간" name="departure_time" type="time" value={formData.departure_time} onChange={handleChange} required />
            <Input label="도착공항" name="departure_airport" value={formData.departure_airport} onChange={handleChange} placeholder="ICN" required />
            <Input label="편명" name="departure_flight" value={formData.departure_flight} onChange={handleChange} placeholder="OZ202" required />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium border-l-2 border-red-500 pl-3">
              저장 오류: {error.message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 h-12 text-lg">
            {loading ? '저장 중...' : '다음 단계로 저장 및 이동'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

