'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Palette, Type, Hash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createEventAction } from '@/actions/events/createEvent';
import toast from 'react-hot-toast';

export default function EventCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    startDate: '',
    endDate: '',
    heroTagline: '',
    primaryColor: '#2563eb',
    secondaryColor: '',
    venueName: '',
    venueAddress: '',
    venueLatitude: '',
    venueLongitude: '',
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

    if (formData.venueLatitude && isNaN(parseFloat(formData.venueLatitude))) {
      newErrors.venueLatitude = '유효한 위도를 입력해주세요.';
    }

    if (formData.venueLongitude && isNaN(parseFloat(formData.venueLongitude))) {
      newErrors.venueLongitude = '유효한 경도를 입력해주세요.';
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
        const result = await createEventAction({
          title: formData.title,
          code: formData.code,
          startDate: formData.startDate,
          endDate: formData.endDate,
          heroTagline: formData.heroTagline || undefined,
          primaryColor: formData.primaryColor || undefined,
          secondaryColor: formData.secondaryColor || undefined,
          venueName: formData.venueName || undefined,
          venueAddress: formData.venueAddress || undefined,
          venueLatitude: formData.venueLatitude ? parseFloat(formData.venueLatitude) : undefined,
          venueLongitude: formData.venueLongitude ? parseFloat(formData.venueLongitude) : undefined,
        });

        if (result.success) {
          toast.success(result.message || '이벤트가 성공적으로 생성되었습니다.');
          router.push('/admin/events');
        } else {
          toast.error(result.message || '이벤트 생성 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('Create event error:', error);
        toast.error(error?.message || '이벤트 생성 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5 text-blue-600" />
            기본 정보
          </CardTitle>
          <CardDescription>이벤트의 기본 정보를 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="이벤트 제목 *"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="예: 2024 ANDERS Global Summit"
            required
          />

          <Input
            label="이벤트 코드 *"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            error={errors.code}
            placeholder="예: summit2024"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero 태그라인
            </label>
            <textarea
              value={formData.heroTagline}
              onChange={(e) => handleChange('heroTagline', e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="랜딩 페이지 Hero 섹션에 표시될 태그라인을 입력하세요."
            />
          </div>
        </CardContent>
      </Card>

      {/* 디자인 설정 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            디자인 설정
          </CardTitle>
          <CardDescription>이벤트 브랜딩 색상을 설정하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Primary 색상"
            type="color"
            value={formData.primaryColor}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            className="h-12"
          />

          <Input
            label="Secondary 색상 (선택)"
            type="color"
            value={formData.secondaryColor}
            onChange={(e) => handleChange('secondaryColor', e.target.value)}
            className="h-12"
          />
        </CardContent>
      </Card>

      {/* 장소 정보 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            장소 정보
          </CardTitle>
          <CardDescription>행사 장소 정보를 입력하세요. (선택사항)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="장소명"
            value={formData.venueName}
            onChange={(e) => handleChange('venueName', e.target.value)}
            placeholder="예: 그랜드 호텔 서울"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <textarea
              value={formData.venueAddress}
              onChange={(e) => handleChange('venueAddress', e.target.value)}
              className="flex min-h-[60px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="예: 서울특별시 강남구 테헤란로 123"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="위도 (선택)"
              type="number"
              step="any"
              value={formData.venueLatitude}
              onChange={(e) => handleChange('venueLatitude', e.target.value)}
              error={errors.venueLatitude}
              placeholder="37.5665"
              helperText="Google Maps에서 확인 가능"
            />

            <Input
              label="경도 (선택)"
              type="number"
              step="any"
              value={formData.venueLongitude}
              onChange={(e) => handleChange('venueLongitude', e.target.value)}
              error={errors.venueLongitude}
              placeholder="126.9780"
              helperText="Google Maps에서 확인 가능"
            />
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
          {isPending ? '생성 중...' : '이벤트 생성'}
        </Button>
      </div>
    </form>
  );
}

