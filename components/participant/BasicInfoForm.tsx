'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { saveParticipantData } from '@/actions/participant';
import { BasicInfo } from '@/lib/types';

interface BasicInfoFormProps {
  eventId: string;
  participantId: string;
  initialData: BasicInfo;
  onSaveSuccess?: () => void;
}

export default function BasicInfoForm({
  eventId,
  participantId,
  initialData,
  onSaveSuccess,
}: BasicInfoFormProps) {
  const [formData, setFormData] = useState<BasicInfo>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value ?? '' });
    if (error) setError(null);
  };

  const validate = () => {
    if (!formData.name) return setError({ field: 'name', message: '이름은 필수 입력 항목입니다.' }), false;
    if (!formData.email) return setError({ field: 'email', message: '이메일은 필수 입력 항목입니다.' }), false;
    if (!formData.phone) return setError({ field: 'phone', message: '연락처는 필수 입력 항목입니다.' }), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError({ field: 'email', message: '유효한 이메일 형식이 아닙니다.' }), false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    const result = await saveParticipantData(eventId, participantId, formData);
    setLoading(false);

    if (result.success) {
      onSaveSuccess?.();
      router.refresh();
      router.push(`/${eventId}/register?step=passport`);
    } else {
      setError({ message: result.message });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>기본 정보 입력</CardTitle>
        <CardDescription>참가자님의 성함, 연락처, 소속 정보를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="이름 (필수)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={error?.field === 'name' ? error.message : undefined}
            placeholder="홍길동"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="이메일 (필수)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={error?.field === 'email' ? error.message : undefined}
              placeholder="user@example.com"
              required
            />
            <Input
              label="연락처 (필수)"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={error?.field === 'phone' ? error.message : undefined}
              placeholder="010-0000-0000"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="소속 회사 (선택)"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="BTL 컴퍼니"
            />
            <Input
              label="직책/직함 (선택)"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="솔루션 전문가"
            />
          </div>
          {error && !error.field && (
            <p className="text-red-500 text-sm font-medium border-l-2 border-red-500 pl-3">
              저장 오류: {error.message}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-[var(--primary)] h-12 text-lg">
            {loading ? '저장 중...' : '다음 단계로 저장 및 이동'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

