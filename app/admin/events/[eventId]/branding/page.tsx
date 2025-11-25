'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Palette, UploadCloud, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EventBranding, PageProps } from '@/lib/types';

const DEFAULT_BRANDING: EventBranding = {
  primary_color: '#0070f3',
  secondary_color: '#f8f8f8',
  kv_image_url: '',
  logo_image_url: '',
};

export default function EventBrandingPage({ params }: PageProps) {
  const eventId = params.eventId as string;
  const supabase = createClientComponentClient();

  const [branding, setBranding] = useState<EventBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchBranding() {
      setLoading(true);
      const { data, error } = await supabase.from('event_branding').select('*').eq('event_id', eventId).single();
      if (error) {
        // empty state acceptable
        setBranding(DEFAULT_BRANDING);
      } else if (data) {
        setBranding({
          primary_color: data.primary_color ?? DEFAULT_BRANDING.primary_color,
          secondary_color: data.secondary_color ?? DEFAULT_BRANDING.secondary_color,
          kv_image_url: data.kv_image_url ?? '',
          logo_image_url: data.logo_image_url ?? '',
        });
      }
      setLoading(false);
    }

    if (eventId) {
      fetchBranding();
    }
  }, [eventId, supabase]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranding((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);

    let updatedBranding = { ...branding };

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('event_assets').upload(fileName, file, {
        upsert: true,
      });

      if (uploadError) {
        toast.error(`이미지 업로드 실패: ${uploadError.message}`);
        setIsSaving(false);
        return;
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event_assets/${fileName}`;
      updatedBranding = { ...updatedBranding, kv_image_url: publicUrl };
    }

    const { error: dbError } = await supabase.from('event_branding').upsert(
      {
        event_id: eventId,
        primary_color: updatedBranding.primary_color,
        secondary_color: updatedBranding.secondary_color,
        kv_image_url: updatedBranding.kv_image_url,
        logo_image_url: updatedBranding.logo_image_url,
      },
      { onConflict: 'event_id' }
    );

    if (dbError) {
      toast.error(`데이터 저장 실패: ${dbError.message}`);
    } else {
      setBranding(updatedBranding);
      toast.success('브랜딩 설정이 성공적으로 저장되었습니다.');
      setFile(null);
    }

    setIsSaving(false);
  };

  if (loading) {
    return <div className="text-center p-8">브랜딩 정보를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">이벤트 브랜딩 관리</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            색상 설정
          </CardTitle>
          <CardDescription>이벤트 웹페이지에 적용될 기본 색상을 지정합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Primary Color"
            name="primary_color"
            type="color"
            value={branding.primary_color}
            onChange={handleColorChange}
            className="h-10 p-1 block w-full cursor-pointer"
          />
          <Input
            label="Secondary Color"
            name="secondary_color"
            type="color"
            value={branding.secondary_color}
            onChange={handleColorChange}
            className="h-10 p-1 block w-full cursor-pointer"
          />
          <div className="col-span-2">
            <div
              className="p-4 rounded-lg font-semibold text-center transition-all duration-300"
              style={{ backgroundColor: branding.primary_color, color: branding.secondary_color }}
            >
              미리보기: Primary {branding.primary_color} / Secondary {branding.secondary_color}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadCloud className="w-5 h-5 mr-2" />
            키 비주얼 (KV) 이미지
          </CardTitle>
          <CardDescription>참가자 메인 페이지 상단에 노출될 이미지를 업로드하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="이미지 파일 선택" type="file" onChange={handleFileChange} />
          {(branding.kv_image_url || file) && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <p className="font-medium text-sm mb-2">현재 이미지 미리보기</p>
              <Image
                src={file ? URL.createObjectURL(file) : branding.kv_image_url || ''}
                alt="KV Preview"
                width={800}
                height={320}
                className="w-full h-48 object-cover rounded-lg shadow-md"
                unoptimized
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-white p-4 border-t shadow-2xl flex justify-end">
        <Button onClick={handleSaveBranding} disabled={isSaving} className="bg-green-600 hover:bg-green-700 h-12 text-lg">
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? '저장 중...' : '브랜딩 설정 저장'}
        </Button>
      </div>
    </div>
  );
}

