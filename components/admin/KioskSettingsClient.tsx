'use client';

import { useState, useTransition } from 'react';
import { Monitor, Copy, Check, Power, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateKioskSettingsAction } from '@/actions/kiosk/updateKioskSettings';
import toast from 'react-hot-toast';

interface KioskSettings {
  is_enabled: boolean;
  pin_code: string | null;
}

interface KioskSettingsClientProps {
  eventId: string;
  initialSettings: KioskSettings;
  kioskUrl: string;
  kioskUrlWithPin: string;
}

export default function KioskSettingsClient({
  eventId,
  initialSettings,
  kioskUrl,
  kioskUrlWithPin,
}: KioskSettingsClientProps) {
  const [isEnabled, setIsEnabled] = useState(initialSettings.is_enabled);
  const [pinCode, setPinCode] = useState(initialSettings.pin_code || '');
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateKioskSettingsAction({
        eventId,
        isEnabled,
        pinCode: pinCode.trim() || null,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCopyUrl = () => {
    const urlToCopy = pinCode.trim() ? kioskUrlWithPin : kioskUrl;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    toast.success('URL이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* KIOSK 활성화 설정 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Power className="h-5 w-5 text-blue-600" />
            KIOSK 활성화
          </CardTitle>
          <CardDescription>KIOSK 모드를 켜거나 끌 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">KIOSK 모드</p>
              <p className="text-sm text-gray-500">
                {isEnabled ? '활성화됨' : '비활성화됨'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* PIN 코드 설정 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-600" />
            PIN 코드 설정
          </CardTitle>
          <CardDescription>
            KIOSK 접근을 보호하기 위한 PIN 코드를 설정할 수 있습니다. (4~6자리 숫자)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="PIN 코드"
            type="text"
            placeholder="예: 1234 (4~6자리 숫자)"
            value={pinCode}
            onChange={(e) => {
              // 숫자만 입력 허용
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setPinCode(value);
              }
            }}
            maxLength={6}
            helperText="PIN 코드를 비워두면 PIN 없이 접근 가능합니다."
          />
        </CardContent>
      </Card>

      {/* KIOSK URL */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-600" />
            KIOSK 접속 URL
          </CardTitle>
          <CardDescription>이 URL을 KIOSK 기기에 입력하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-gray-900 break-all">
                {pinCode.trim() ? kioskUrlWithPin : kioskUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>
          {pinCode.trim() && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <Lock className="h-4 w-4" />
              PIN 코드가 설정되어 있습니다. 위 URL에 PIN이 포함되어 있습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="px-8">
          {isPending ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}

