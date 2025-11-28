'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cloneEventAction } from '@/actions/events/cloneEvent';
import toast from 'react-hot-toast';

interface EventCloneFormProps {
  sourceEventId: string;
  sourceEvent: {
    title: string;
    code: string;
    start_date: string;
    end_date: string;
    hero_tagline?: string | null;
    primary_color?: string | null;
    venue_name?: string | null;
  };
}

export default function EventCloneForm({ sourceEventId, sourceEvent }: EventCloneFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 기본값: 원본 이벤트 정보 + "_copy" 접미사
  const [formData, setFormData] = useState({
    title: `${sourceEvent.title} (복사본)`,
    code: `${sourceEvent.code}_copy`,
    startDate: sourceEvent.start_date,
    endDate: sourceEvent.end_date,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '이벤트 제목은 필수입니다.';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '이벤트 제목은 최소 2자 이상이어야 합니다.';
    }

    if (!formData.code.trim()) {
      newErrors.code = '이벤트 코드는 필수입니다.';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = '이벤트 코드는 최소 2자 이상이어야 합니다.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = '이벤트 코드는 영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다.';
    }

    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜는 필수입니다.';
    }

    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜는 필수입니다.';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = '종료 날짜는 시작 날짜보다 이후여야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await cloneEventAction({
          sourceEventId,
          title: formData.title,
          code: formData.code,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });

        if (result.success) {
          toast.success(result.message || '이벤트가 성공적으로 복제되었습니다.');
          router.push('/admin/events');
        } else {
          toast.error(result.message || '이벤트 복제 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('Clone event error:', error);
        toast.error(error?.message || '이벤트 복제 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 원본 이벤트 정보 */}
      <Card className="border border-gray-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-600" />
            원본 이벤트 정보
          </CardTitle>
          <CardDescription>다음 이벤트를 복제합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">제목:</span>
            <span className="text-gray-900">{sourceEvent.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">코드:</span>
            <span className="text-gray-900 font-mono">{sourceEvent.code}</span>
          </div>
          {sourceEvent.hero_tagline && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">태그라인:</span>
              <span className="text-gray-900">{sourceEvent.hero_tagline}</span>
            </div>
          )}
          {sourceEvent.venue_name && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">장소:</span>
              <span className="text-gray-900">{sourceEvent.venue_name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 새 이벤트 정보 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            새 이벤트 정보
          </CardTitle>
          <CardDescription>복제할 새 이벤트의 정보를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="이벤트 제목 *"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            required
          />

          <Input
            label="이벤트 코드 *"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            error={errors.code}
            required
            helperText="영문, 숫자, 하이픈, 언더스코어만 사용 가능합니다."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="시작 날짜 *"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              error={errors.startDate}
              required
            />

            <Input
              label="종료 날짜 *"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              error={errors.endDate}
              required
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>복제되는 항목:</strong> Hero 태그라인, 색상 설정, 장소 정보, 스케줄, 브랜딩 설정
            </p>
            <p className="text-sm text-gray-500 mt-1">
              참가자, 테이블 배정, 메일 로그는 복제되지 않습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
        >
          {isPending ? '복제 중...' : '이벤트 복제'}
        </Button>
      </div>
    </form>
  );
}

