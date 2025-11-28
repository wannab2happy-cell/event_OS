'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, CheckCircle, XCircle, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface Participant {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  is_checked_in: boolean | null;
  vip_level: number | null;
  tableName: string | null;
}

interface StaffParticipantsClientProps {
  eventId: string;
  participants: Participant[];
}

export default function StaffParticipantsClient({
  eventId,
  participants: initialParticipants,
}: StaffParticipantsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialParticipants;
    }

    const query = searchQuery.toLowerCase();
    return initialParticipants.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.company?.toLowerCase().includes(query)
    );
  }, [initialParticipants, searchQuery]);

  const handleParticipantClick = (participantId: string) => {
    router.push(`/staff/${eventId}/lookup?participantId=${participantId}`);
  };

  const getStatusBadge = (status: string, isCheckedIn: boolean | null) => {
    if (isCheckedIn) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
          <CheckCircle className="h-3 w-3" />
          체크인
        </span>
      );
    }

    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
            등록완료
          </span>
        );
      case 'registered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            등록중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
            초대
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <Input
            placeholder="이름, 이메일, 회사로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* 참가자 테이블 */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    회사
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    VIP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    테이블
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      onClick={() => handleParticipantClick(participant.id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {participant.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{participant.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {participant.company || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(participant.status, participant.is_checked_in)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {participant.vip_level && participant.vip_level > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            <Crown className="h-3 w-3" />
                            Level {participant.vip_level}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {participant.tableName || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 요약 정보 */}
      <div className="text-sm text-gray-500 text-center">
        총 {filteredParticipants.length}명 표시 중
      </div>
    </div>
  );
}

