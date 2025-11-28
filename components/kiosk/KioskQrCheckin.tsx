'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, AlertTriangle, Crown } from 'lucide-react';
import { scanCheckinAction } from '@/actions/checkin/scanCheckin';
import { getParticipantDetailAction } from '@/actions/staff/getParticipantDetail';

interface KioskQrCheckinProps {
  eventId: string;
  primaryColor: string;
}

type CheckinState = 'idle' | 'success' | 'error';

interface CheckinResult {
  name: string;
  email: string;
  company?: string | null;
  vipLevel: number;
  alreadyChecked: boolean;
}

export default function KioskQrCheckin({ eventId, primaryColor }: KioskQrCheckinProps) {
  const [qrValue, setQrValue] = useState('');
  const [state, setState] = useState<CheckinState>('idle');
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // 입력창에 항상 포커스 유지
  useEffect(() => {
    if (state === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  // 성공 후 5초 뒤 자동 리셋
  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => {
        handleReset();
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleScan = () => {
    if (!qrValue.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await scanCheckinAction({
          eventId,
          qr: qrValue.trim(),
          source: 'kiosk',
        });

        // 참가자 상세 정보 가져오기 (company 정보 포함)
        const detailResult = await getParticipantDetailAction({
          eventId,
          participantId: res.participant.id,
        });

        setResult({
          name: res.participant.name,
          email: res.participant.email,
          company: detailResult.success && detailResult.participant
            ? (detailResult.participant as any).company || null
            : null,
          vipLevel: res.participant.vipLevel,
          alreadyChecked: res.alreadyChecked,
        });

        if (res.alreadyChecked) {
          setState('error');
          setErrorMessage('이미 체크인된 참가자입니다.');
        } else {
          setState('success');
        }
      } catch (e: any) {
        console.error('Kiosk checkin error:', e);
        setState('error');
        setErrorMessage(e.message || '체크인 중 오류가 발생했습니다.');
      }
    });
  };

  const handleReset = () => {
    setQrValue('');
    setState('idle');
    setResult(null);
    setErrorMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending && state === 'idle') {
      e.preventDefault();
      handleScan();
    }
  };

  // 성공 화면
  if (state === 'success' && result) {
    const isVip = result.vipLevel > 0;
    return (
      <div className="w-full max-w-2xl text-center">
        <div
          className={`rounded-3xl p-12 shadow-2xl ${
            isVip
              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-4 border-amber-400'
              : 'bg-gradient-to-br from-emerald-50 to-green-50 border-4 border-emerald-400'
          }`}
        >
          <div className="mb-6">
            {isVip ? (
              <Crown className="h-20 w-20 text-amber-500 mx-auto mb-4" />
            ) : (
              <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
            )}
          </div>
          <h2
            className={`text-5xl font-bold mb-4 ${
              isVip ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            체크인 완료
          </h2>
          {isVip && (
            <p className="text-3xl font-semibold text-amber-600 mb-6">VIP Welcome</p>
          )}
          <div className="space-y-3 mb-8">
            <p className="text-3xl font-semibold text-gray-900">{result.name}</p>
            {result.company && (
              <p className="text-2xl text-gray-600">{result.company}</p>
            )}
            <p className="text-xl text-gray-500">{result.email}</p>
          </div>
          <p className="text-lg text-gray-500">잠시 후 자동으로 초기화됩니다...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (state === 'error') {
    return (
      <div className="w-full max-w-2xl text-center">
        <div className="rounded-3xl p-12 shadow-2xl bg-red-50 border-4 border-red-400">
          <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-5xl font-bold text-red-700 mb-4">오류</h2>
          <p className="text-2xl text-red-600 mb-8">{errorMessage}</p>
          <button
            onClick={handleReset}
            className="px-8 py-4 text-xl font-semibold text-white rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 입력 화면
  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-8">
        <QrCode className="h-24 w-24 mx-auto mb-6 text-gray-400" />
        <h2 className="text-4xl font-bold text-gray-900 mb-2">QR 코드를 스캔하세요</h2>
        <p className="text-xl text-gray-600">QR 코드를 입력창에 붙여넣거나 스캔하세요</p>
      </div>
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={qrValue}
          onChange={(e) => setQrValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isPending}
          placeholder="QR 코드 입력"
          className="w-full px-6 py-6 text-2xl border-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all"
          style={{
            borderColor: primaryColor,
            focusRingColor: primaryColor,
          }}
          autoFocus
        />
        <button
          onClick={handleScan}
          disabled={isPending || !qrValue.trim()}
          className="w-full py-6 text-2xl font-semibold text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          {isPending ? '처리 중...' : '체크인'}
        </button>
      </div>
    </div>
  );
}

