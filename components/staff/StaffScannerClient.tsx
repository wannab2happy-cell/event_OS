'use client';

import { useState, useTransition } from 'react';
import { QrCode, Crown, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { scanCheckinAction } from '@/actions/checkin/scanCheckin';
import toast from 'react-hot-toast';

interface ScanResult {
  name: string;
  email: string;
  vipLevel: number;
  alreadyChecked: boolean;
}

interface RecentLog {
  id: string;
  createdAt: string;
  isDuplicate: boolean;
  participant: {
    name: string;
    email: string;
    vipLevel: number;
  };
}

interface StaffScannerClientProps {
  eventId: string;
  staffEmail: string;
}

export default function StaffScannerClient({ eventId, staffEmail }: StaffScannerClientProps) {
  const [qrValue, setQrValue] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  const handleScan = () => {
    if (!qrValue.trim()) {
      toast.error('QR 값을 입력해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await scanCheckinAction({
          eventId,
          qr: qrValue.trim(),
          scannedBy: staffEmail,
        });

        setResult({
          name: res.participant.name,
          email: res.participant.email,
          vipLevel: res.participant.vipLevel,
          alreadyChecked: res.alreadyChecked,
        });

        // 최근 로그에 추가 (최대 5개)
        setRecentLogs((prev) => [
          {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isDuplicate: res.alreadyChecked,
            participant: {
              name: res.participant.name,
              email: res.participant.email,
              vipLevel: res.participant.vipLevel,
            },
          },
          ...prev.slice(0, 4),
        ]);

        if (res.alreadyChecked) {
          toast.error('이미 체크인된 참가자입니다.');
        } else {
          toast.success('체크인 완료');
        }

        setQrValue('');
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || '체크인 중 오류가 발생했습니다.');
        setResult(null);
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan();
    }
  };

  return (
    <div className="space-y-6">
      {/* 스캔 입력 영역 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            QR 스캔
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="QR 값 또는 참가자 토큰을 입력하세요"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isPending}
              className="flex-1"
            />
            <Button onClick={handleScan} disabled={isPending || !qrValue.trim()}>
              {isPending ? '처리 중...' : '체크인'}
            </Button>
          </div>

          {/* 체크인 결과 */}
          {result && (
            <div
              className={`mt-4 rounded-xl border p-4 flex items-center justify-between ${
                result.vipLevel > 0
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-emerald-400 bg-emerald-50/60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.vipLevel > 0 && <Crown className="w-4 h-4 text-amber-500" />}
                  <span className="font-semibold text-gray-900">{result.name || '이름 없음'}</span>
                </div>
                <div className="text-xs text-gray-600">{result.email}</div>
                {result.vipLevel > 0 && (
                  <div className="text-xs text-amber-600 mt-1">VIP Level {result.vipLevel}</div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium">
                {result.alreadyChecked ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">이미 체크인됨</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700">체크인 완료</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 체크인 로그 (최대 5개) */}
      {recentLogs.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">최근 체크인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    log.participant.vipLevel > 0
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {log.participant.vipLevel > 0 && (
                      <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {log.participant.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{log.participant.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                    {log.isDuplicate && (
                      <span className="text-red-600 font-medium">중복</span>
                    )}
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

