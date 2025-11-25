'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { savePassportData } from '@/actions/participant';

interface PassportFormProps {
  eventId: string;
  participantId: string;
  initialData: {
    passport_number?: string;
    passport_expiry?: string;
    visa_required?: boolean;
  };
  onSaveSuccess?: () => void;
}

export default function PassportForm({
  eventId,
  participantId,
  initialData,
  onSaveSuccess,
}: PassportFormProps) {
  const [formData, setFormData] = useState({
    passport_number: initialData.passport_number || '',
    passport_expiry: initialData.passport_expiry || '',
    visa_required: initialData.visa_required ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value ?? '';
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError(null);
  };

  const validate = () => {
    if (!formData.passport_number) {
      setError({ field: 'passport_number', message: '여권 번호는 필수입니다.' });
      return false;
    }
    if (!formData.passport_expiry) {
      setError({ field: 'passport_expiry', message: '여권 만료일은 필수입니다.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    const result = await savePassportData(eventId, participantId, {
      passport_number: formData.passport_number,
      passport_expiry: formData.passport_expiry,
      visa_required: formData.visa_required,
    });
    setLoading(false);

    if (result.success) {
      onSaveSuccess?.();
      router.refresh();
      router.push(`/${eventId}/register?step=flight`);
    } else {
      setError({ message: result.message });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>여권 및 비자 정보</CardTitle>
        <CardDescription>국제 행사를 위해 여권과 비자 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="여권 번호 (필수)"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            error={error?.field === 'passport_number' ? error.message : undefined}
            placeholder="예: M12345678"
            required
          />
          <Input
            label="여권 만료일 (필수)"
            name="passport_expiry"
            type="date"
            value={formData.passport_expiry}
            onChange={handleChange}
            error={error?.field === 'passport_expiry' ? error.message : undefined}
            required
          />

          <div className="flex items-center space-x-2 border p-4 rounded-lg bg-gray-50">
            <input
              id="visa_required"
              name="visa_required"
              type="checkbox"
              checked={formData.visa_required}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="visa_required" className="text-sm font-medium text-gray-700 select-none">
              비자 발급이 필요합니다.
            </label>
          </div>

          {error && !error.field && (
            <p className="text-red-500 text-sm font-medium border-l-2 border-red-500 pl-3">저장 오류: {error.message}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-blue-600 h-12 text-lg">
            {loading ? '저장 중...' : '다음 단계로 저장 및 이동'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

