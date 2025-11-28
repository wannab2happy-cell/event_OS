'use client';

import { useState, useTransition } from 'react';
import { Search, CheckCircle, AlertTriangle, Crown, User } from 'lucide-react';
import { searchParticipantAction } from '@/actions/staff/searchParticipant';
import { getParticipantDetailAction } from '@/actions/staff/getParticipantDetail';
import { scanCheckinAction } from '@/actions/checkin/scanCheckin';
import toast from 'react-hot-toast';

interface KioskSearchCheckinProps {
  eventId: string;
  primaryColor: string;
}

type SearchState = 'search' | 'confirm' | 'success' | 'error';

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface CheckinResult {
  name: string;
  email: string;
  company?: string | null;
  vipLevel: number;
  alreadyChecked: boolean;
}

export default function KioskSearchCheckin({ eventId, primaryColor }: KioskSearchCheckinProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState<SearchState>('search');
  const [candidates, setCandidates] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await searchParticipantAction({
          eventId,
          query: searchQuery.trim(),
        });

        if (!res.success || !res.results || res.results.length === 0) {
          setState('error');
          setErrorMessage('검색 결과가 없습니다. 이름, 이메일, 또는 회사를 다시 확인해주세요.');
          return;
        }

        if (res.results.length === 1) {
          // 결과가 1개면 바로 확인 화면으로
          setSelectedParticipant(res.results[0]);
          setState('confirm');
        } else {
          // 여러 개면 후보 리스트 표시
          setCandidates(res.results);
          setState('confirm');
        }
      } catch (e: any) {
        console.error('Search error:', e);
        setState('error');
        setErrorMessage('검색 중 오류가 발생했습니다.');
      }
    });
  };

  const handleSelectParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setState('confirm');
  };

  const handleConfirmCheckin = () => {
    if (!selectedParticipant) {
      return;
    }

    startTransition(async () => {
      try {
        // 참가자 상세 정보 가져오기 (company 정보 포함)
        const detailResult = await getParticipantDetailAction({
          eventId,
          participantId: selectedParticipant.id,
        });

        // participantId를 QR로 사용
        const res = await scanCheckinAction({
          eventId,
          qr: selectedParticipant.id,
          source: 'kiosk',
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
        console.error('Checkin error:', e);
        setState('error');
        setErrorMessage(e.message || '체크인 중 오류가 발생했습니다.');
      }
    });
  };

  const handleReset = () => {
    setSearchQuery('');
    setState('search');
    setCandidates([]);
    setSelectedParticipant(null);
    setResult(null);
    setErrorMessage('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending && state === 'search') {
      e.preventDefault();
      handleSearch();
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

  // 확인 화면
  if (state === 'confirm' && selectedParticipant) {
    return (
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl p-12 shadow-2xl bg-white border-4 border-gray-200">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            이 정보가 맞나요?
          </h2>
          <div className="space-y-4 mb-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedParticipant.name}
              </p>
              <p className="text-xl text-gray-600">{selectedParticipant.email}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-6 text-xl font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirmCheckin}
              disabled={isPending}
              className="flex-1 py-6 text-xl font-semibold text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isPending ? '처리 중...' : '체크인'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 후보 리스트 화면
  if (state === 'confirm' && candidates.length > 1) {
    return (
      <div className="w-full max-w-3xl">
        <div className="rounded-3xl p-8 shadow-2xl bg-white border-4 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            검색 결과 ({candidates.length}명)
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => handleSelectParticipant(candidate)}
                className="w-full p-6 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border-2 border-transparent hover:border-gray-300"
              >
                <div className="flex items-center gap-4">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xl text-gray-600">{candidate.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-6 py-4 text-xl font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            다시 검색
          </button>
        </div>
      </div>
    );
  }

  // 검색 화면
  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-8">
        <Search className="h-24 w-24 mx-auto mb-6 text-gray-400" />
        <h2 className="text-4xl font-bold text-gray-900 mb-2">참가자 검색</h2>
        <p className="text-xl text-gray-600">이름, 이메일, 또는 회사명을 입력하세요</p>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isPending}
          placeholder="이름, 이메일, 또는 회사명"
          className="w-full px-6 py-6 text-2xl border-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all"
          style={{
            borderColor: primaryColor,
            focusRingColor: primaryColor,
          }}
          autoFocus
        />
        <button
          onClick={handleSearch}
          disabled={isPending || !searchQuery.trim()}
          className="w-full py-6 text-2xl font-semibold text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: primaryColor }}
        >
          {isPending ? '검색 중...' : '검색'}
        </button>
      </div>
    </div>
  );
}

