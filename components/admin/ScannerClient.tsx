'use client';

import { useState, useTransition } from 'react';
import { QrCode, Crown, CheckCircle, AlertTriangle, Clock, User, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { scanCheckinAction } from '@/actions/checkin/scanCheckin';
import toast from 'react-hot-toast';

interface CheckinLog {
  id: string;
  createdAt: string;
  isDuplicate: boolean;
  scannedBy: string | null;
  source: string | null;
  participant: {
    id: string;
    name: string;
    email: string;
    vipLevel: number;
  };
}

interface ScannerClientProps {
  eventId: string;
  recentLogs: CheckinLog[];
}

interface ScanResult {
  name: string;
  email: string;
  vipLevel: number;
  alreadyChecked: boolean;
}

export default function ScannerClient({ eventId, recentLogs: initialLogs }: ScannerClientProps) {
  const [qrValue, setQrValue] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isPending, startTransition] = useTransition();

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
          scannedBy: 'admin',
        });

        setResult({
          name: res.participant.name,
          email: res.participant.email,
          vipLevel: res.participant.vipLevel,
          alreadyChecked: res.alreadyChecked,
        });

        if (res.alreadyChecked) {
          toast.error('이미 체크인된 참가자입니다.');
        } else {
          toast.success('체크인 완료');
        }

        // 입력 필드 초기화 및 포커스
        setQrValue('');
        // 페이지 새로고침하여 로그 업데이트
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e: any) {
        console.error('Scan checkin error:', e);
        toast.error(e?.message || '체크인 중 오류가 발생했습니다.');
        setResult(null);
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      e.preventDefault();
      handleScan();
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* 스캐너 카드 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            현장 체크인 스캐너
          </CardTitle>
          <CardDescription>QR 코드를 스캔하거나 QR 값을 입력하여 체크인하세요.</CardDescription>
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
              autoFocus
            />
            <Button onClick={handleScan} disabled={isPending || !qrValue.trim()}>
              {isPending ? '처리 중...' : '체크인'}
            </Button>
          </div>

          {/* 체크인 결과 */}
          {result && (
            <div
              className={`mt-4 rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                result.vipLevel > 0
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-emerald-400 bg-emerald-50/60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.vipLevel > 0 && <Crown className="w-5 h-5 text-amber-500" />}
                  <span className="font-semibold text-lg">{result.name || '이름 없음'}</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <Mail className="w-4 h-4" />
                  {result.email}
                </div>
                {result.vipLevel > 0 && (
                  <div className="text-xs text-amber-600 font-medium mt-1">
                    VIP Level {result.vipLevel}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {result.alreadyChecked ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">이미 체크인됨</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-700">체크인 완료</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 체크인 로그 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">최근 체크인 로그</CardTitle>
          <CardDescription>최근 20건의 체크인 기록을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {initialLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">아직 체크인 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      시간
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      참가자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      스캔 담당
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {log.participant.vipLevel > 0 && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{log.participant.name}</div>
                            <div className="text-xs text-gray-500">{log.participant.email}</div>
                            {log.participant.vipLevel > 0 && (
                              <div className="text-xs text-amber-600 mt-1">
                                VIP Level {log.participant.vipLevel}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            중복
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            체크인
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.scannedBy || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

