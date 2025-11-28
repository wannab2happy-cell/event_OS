'use client';

import { useState, useTransition } from 'react';
import { Search, Crown, CheckCircle, XCircle, User, Mail, Building, Phone, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { scanCheckinAction } from '@/actions/checkin/scanCheckin';
import { searchParticipantAction } from '@/actions/staff/searchParticipant';
import { getParticipantDetailAction } from '@/actions/staff/getParticipantDetail';
import toast from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  position: string | null;
  status: string;
  is_checked_in: boolean | null;
  checked_in_at: string | null;
  vip_level: number | null;
  tableName: string | null;
  arrival_date: string | null;
  arrival_flight: string | null;
  hotel_name: string | null;
}

interface StaffLookupClientProps {
  eventId: string;
  initialParticipantId?: string;
  staffEmail: string;
}

export default function StaffLookupClient({
  eventId,
  initialParticipantId,
  staffEmail,
}: StaffLookupClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [participantId, setParticipantId] = useState<string | null>(initialParticipantId || null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 초기 participantId가 있으면 로드
  useEffect(() => {
    if (initialParticipantId) {
      loadParticipant(initialParticipantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadParticipant = async (id: string) => {
    setIsSearching(true);
    try {
      const result = await getParticipantDetailAction({
        eventId,
        participantId: id,
      });

      if (!result.success || !result.participant) {
        toast.error(result.message || '참가자를 찾을 수 없습니다.');
        setParticipant(null);
        return;
      }

      setParticipant(result.participant as Participant);
      setParticipantId(id);
    } catch (error) {
      console.error('Load participant error:', error);
      toast.error('참가자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchParticipantAction({
        eventId,
        query: searchQuery.trim(),
      });

      if (!result.success || !result.results || result.results.length === 0) {
        toast.error(result.message || '검색 결과가 없습니다.');
        return;
      }

      // 결과가 1개면 바로 로드, 여러 개면 첫 번째 로드
      if (result.results.length === 1) {
        await loadParticipant(result.results[0].id);
      } else {
        // 여러 개면 첫 번째 로드하고 토스트로 알림
        await loadParticipant(result.results[0].id);
        toast.success(`${result.results.length}명의 결과 중 첫 번째 결과를 표시합니다.`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckin = () => {
    if (!participant || !participantId) {
      return;
    }

    startTransition(async () => {
      try {
        // participantId를 QR로 사용
        const res = await scanCheckinAction({
          eventId,
          qr: participantId,
          scannedBy: staffEmail,
        });

        if (res.alreadyChecked) {
          toast.error('이미 체크인된 참가자입니다.');
        } else {
          toast.success('체크인 완료');
        }

        // 참가자 정보 다시 로드
        await loadParticipant(participantId);
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || '체크인 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 검색 영역 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            참가자 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="이름, 이메일, 회사 또는 참가자 ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              disabled={isSearching}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? '검색 중...' : '검색'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 참가자 상세 정보 */}
      {participant && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              참가자 상세 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">이름</label>
                <div className="flex items-center gap-2">
                  {participant.vip_level && participant.vip_level > 0 && (
                    <Crown className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{participant.name}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">이메일</label>
                <div className="text-sm text-gray-900">{participant.email}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">연락처</label>
                <div className="text-sm text-gray-900">{participant.phone || '-'}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">회사</label>
                <div className="text-sm text-gray-900">{participant.company || '-'}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">직책</label>
                <div className="text-sm text-gray-900">{participant.position || '-'}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">상태</label>
                <div className="text-sm">
                  {participant.is_checked_in ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      체크인 완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      <XCircle className="h-3 w-3" />
                      미체크인
                    </span>
                  )}
                </div>
              </div>
              {participant.vip_level && participant.vip_level > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">VIP</label>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                    <Crown className="h-3 w-3" />
                    Level {participant.vip_level}
                  </span>
                </div>
              )}
              {participant.tableName && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">테이블</label>
                  <div className="text-sm text-gray-900">{participant.tableName}</div>
                </div>
              )}
            </div>

            {/* 체크인 버튼 */}
            {!participant.is_checked_in && (
              <div className="pt-4 border-t border-gray-200">
                <Button onClick={handleCheckin} disabled={isPending} className="w-full">
                  {isPending ? '처리 중...' : '체크인 처리'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

