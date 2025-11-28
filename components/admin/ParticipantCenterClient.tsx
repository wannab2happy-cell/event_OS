'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Users,
  Mail,
  QrCode,
  Crown,
  Table,
  CheckCircle,
  X,
  ExternalLink,
  Save,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import type { ParticipantExtended, Event, ParticipantStatus } from '@/lib/types';
import { mapStatusToLabel, mapVipLevelToLabel } from '@/lib/types';
import { updateParticipantBasicInfoAction } from '@/actions/participants-center/updateParticipantBasicInfo';
import { updateParticipantTravelAction } from '@/actions/participants-center/updateParticipantTravel';
import { updateParticipantHotelAction } from '@/actions/participants-center/updateParticipantHotel';
import { updateParticipantNotesAction } from '@/actions/participants-center/updateParticipantNotes';

interface ParticipantCenterClientProps {
  event: {
    id: string;
    title: string;
    code: string;
    start_date?: string | null;
    end_date?: string | null;
    venue_name?: string | null;
  };
  participants: ParticipantExtended[];
}

type StatusFilter = ParticipantStatus[];
type VipFilter = 'all' | 'vip_only' | 'non_vip';
type TableFilter = 'all' | 'assigned' | 'unassigned';
type TravelFilter = 'all' | 'confirmed' | 'unconfirmed';
type HotelFilter = 'all' | 'confirmed' | 'unconfirmed';
type ActiveTab = 'overview' | 'profile' | 'travel' | 'hotel' | 'notes';

export default function ParticipantCenterClient({
  event,
  participants: initialParticipants,
}: ParticipantCenterClientProps) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>([]);
  const [vipFilter, setVipFilter] = useState<VipFilter>('all');
  const [tableFilter, setTableFilter] = useState<TableFilter>('all');
  const [travelFilter, setTravelFilter] = useState<TravelFilter>('all');
  const [hotelFilter, setHotelFilter] = useState<HotelFilter>('all');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isPending, startTransition] = useTransition();

  // 필터링된 참가자 목록
  const filteredParticipants = useMemo(() => {
    return initialParticipants.filter((p) => {
      // 검색 필터
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          p.participant.name.toLowerCase().includes(searchLower) ||
          p.participant.email.toLowerCase().includes(searchLower) ||
          (p.participant.company && p.participant.company.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // 상태 필터
      if (statusFilter.length > 0 && !statusFilter.includes(p.participant.status)) {
        return false;
      }

      // VIP 필터
      if (vipFilter === 'vip_only' && (p.vip_level || 0) === 0) {
        return false;
      }
      if (vipFilter === 'non_vip' && (p.vip_level || 0) > 0) {
        return false;
      }

      // 테이블 필터
      if (tableFilter === 'assigned' && !p.table) {
        return false;
      }
      if (tableFilter === 'unassigned' && p.table) {
        return false;
      }

      // 항공 필터
      if (travelFilter === 'confirmed' && !p.travel?.is_travel_confirmed) {
        return false;
      }
      if (travelFilter === 'unconfirmed' && p.travel?.is_travel_confirmed) {
        return false;
      }

      // 호텔 필터
      if (hotelFilter === 'confirmed' && !p.hotel?.is_hotel_confirmed) {
        return false;
      }
      if (hotelFilter === 'unconfirmed' && p.hotel?.is_hotel_confirmed) {
        return false;
      }

      return true;
    });
  }, [initialParticipants, searchText, statusFilter, vipFilter, tableFilter, travelFilter, hotelFilter]);

  const selectedParticipant = useMemo(() => {
    if (!selectedParticipantId) return null;
    return filteredParticipants.find((p) => p.participant.id === selectedParticipantId) || null;
  }, [filteredParticipants, selectedParticipantId]);

  // 상태 필터 토글
  const toggleStatusFilter = (status: ParticipantStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* 좌측: 필터 패널 */}
      <div className="w-[280px] space-y-4 overflow-y-auto">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              필터
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="이름, 이메일, 회사..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <div className="space-y-2">
                {(['invited', 'registered', 'completed', 'checked_in'] as ParticipantStatus[]).map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{mapStatusToLabel(status)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* VIP 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VIP</label>
              <select
                value={vipFilter}
                onChange={(e) => setVipFilter(e.target.value as VipFilter)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="vip_only">VIP만</option>
                <option value="non_vip">일반 참가자</option>
              </select>
            </div>

            {/* 테이블 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">테이블</label>
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value as TableFilter)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="assigned">배정됨</option>
                <option value="unassigned">미배정</option>
              </select>
            </div>

            {/* 항공 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">항공</label>
              <select
                value={travelFilter}
                onChange={(e) => setTravelFilter(e.target.value as TravelFilter)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="confirmed">확정됨</option>
                <option value="unconfirmed">미확정</option>
              </select>
            </div>

            {/* 호텔 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">호텔</label>
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value as HotelFilter)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="confirmed">확정됨</option>
                <option value="unconfirmed">미확정</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 중앙: 참가자 리스트 */}
      <div className="flex-1 overflow-y-auto">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              참가자 목록 ({filteredParticipants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">회사</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">테이블</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">체크인</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((p) => {
                      const isSelected = selectedParticipantId === p.participant.id;
                      const statusLabel = mapStatusToLabel(p.participant.status);
                      const isVip = (p.vip_level || 0) > 0;
                      const vipLabel = mapVipLevelToLabel(p.vip_level);

                      return (
                        <tr
                          key={p.participant.id}
                          onClick={() => {
                            setSelectedParticipantId(p.participant.id);
                            setActiveTab('overview');
                          }}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.participant.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.participant.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.participant.company || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                p.participant.status === 'checked_in'
                                  ? 'bg-green-100 text-green-700'
                                  : p.participant.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : p.participant.status === 'registered'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isVip ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <Crown className="h-3 w-3 mr-1" />
                                {vipLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {p.table ? (
                              <span className="inline-flex items-center gap-1">
                                <Table className="h-3 w-3" />
                                {p.table.name}
                              </span>
                            ) : (
                              <span className="text-gray-400">미배정</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.is_checked_in ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                완료
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">미완료</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 우측: 상세 패널 */}
      {selectedParticipant && (
        <ParticipantDetailPanel
          event={event}
          participant={selectedParticipant}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setSelectedParticipantId(null)}
        />
      )}
    </div>
  );
}

// 우측 상세 패널 컴포넌트
function ParticipantDetailPanel({
  event,
  participant,
  activeTab,
  onTabChange,
  onClose,
}: {
  event: { id: string; code: string; title: string };
  participant: ParticipantExtended;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  // Profile 폼 상태
  const [profileData, setProfileData] = useState({
    company: participant.participant.company || '',
    position: participant.participant.position || '',
    mobile_phone: (participant.participant as any).mobile_phone || '',
    phone: participant.participant.phone || '',
    dietary_restrictions: (participant.participant as any).dietary_restrictions || '',
    note: (participant.participant as any).note || '',
  });

  // Travel 폼 상태
  const [travelData, setTravelData] = useState({
    arrival_airport: participant.travel?.arrival_airport || '',
    arrival_date: participant.participant.arrival_date || '',
    arrival_time: participant.participant.arrival_time || '',
    arrival_flight: participant.travel?.arrival_flight_no || '',
    departure_airport: participant.travel?.departure_airport || '',
    departure_date: participant.participant.departure_date || '',
    departure_time: participant.participant.departure_time || '',
    departure_flight: participant.travel?.departure_flight_no || '',
    is_travel_confirmed: participant.travel?.is_travel_confirmed || false,
  });

  // Hotel 폼 상태
  const [hotelData, setHotelData] = useState({
    hotel_check_in: participant.hotel?.check_in_date || '',
    hotel_check_out: participant.hotel?.check_out_date || '',
    room_preference: participant.hotel?.room_type || '',
    is_hotel_confirmed: participant.hotel?.is_hotel_confirmed || false,
  });

  // Notes 폼 상태
  const [notesData, setNotesData] = useState({
    note: (participant.participant as any).note || '',
  });

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        const result = await updateParticipantBasicInfoAction({
          eventId: event.id,
          participantId: participant.participant.id,
          company: profileData.company || null,
          position: profileData.position || null,
          mobile_phone: profileData.mobile_phone || null,
          phone: profileData.phone || null,
          dietary_restrictions: profileData.dietary_restrictions || null,
          note: profileData.note || null,
        });

        if (result.success) {
          toast.success(result.message || '기본 정보가 저장되었습니다.');
          window.location.reload();
        } else {
          toast.error(result.message || '저장에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Save profile error:', error);
        toast.error(error?.message || '저장 중 오류가 발생했습니다.');
      }
    });
  };

  const handleSaveTravel = () => {
    startTransition(async () => {
      try {
        const result = await updateParticipantTravelAction({
          eventId: event.id,
          participantId: participant.participant.id,
          arrival_airport: travelData.arrival_airport || null,
          arrival_date: travelData.arrival_date || null,
          arrival_time: travelData.arrival_time || null,
          arrival_flight: travelData.arrival_flight || null,
          departure_airport: travelData.departure_airport || null,
          departure_date: travelData.departure_date || null,
          departure_time: travelData.departure_time || null,
          departure_flight: travelData.departure_flight || null,
          is_travel_confirmed: travelData.is_travel_confirmed,
        });

        if (result.success) {
          toast.success(result.message || '항공 정보가 저장되었습니다.');
          window.location.reload();
        } else {
          toast.error(result.message || '저장에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Save travel error:', error);
        toast.error(error?.message || '저장 중 오류가 발생했습니다.');
      }
    });
  };

  const handleSaveHotel = () => {
    startTransition(async () => {
      try {
        const result = await updateParticipantHotelAction({
          eventId: event.id,
          participantId: participant.participant.id,
          hotel_check_in: hotelData.hotel_check_in || null,
          hotel_check_out: hotelData.hotel_check_out || null,
          room_preference: (hotelData.room_preference as 'single' | 'twin') || null,
          is_hotel_confirmed: hotelData.is_hotel_confirmed,
        });

        if (result.success) {
          toast.success(result.message || '호텔 정보가 저장되었습니다.');
          window.location.reload();
        } else {
          toast.error(result.message || '저장에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Save hotel error:', error);
        toast.error(error?.message || '저장 중 오류가 발생했습니다.');
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      try {
        const result = await updateParticipantNotesAction({
          eventId: event.id,
          participantId: participant.participant.id,
          note: notesData.note || null,
        });

        if (result.success) {
          toast.success(result.message || '메모가 저장되었습니다.');
          window.location.reload();
        } else {
          toast.error(result.message || '저장에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Save notes error:', error);
        toast.error(error?.message || '저장 중 오류가 발생했습니다.');
      }
    });
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: '개요' },
    { id: 'profile', label: '프로필' },
    { id: 'travel', label: '항공' },
    { id: 'hotel', label: '호텔' },
    { id: 'notes', label: '메모' },
  ];

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white h-full flex flex-col sticky top-0">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">참가자 상세</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900">{participant.participant.name}</h4>
            <p className="text-sm text-gray-600">{participant.participant.email}</p>
            {participant.participant.company && (
              <p className="text-sm text-gray-600">{participant.participant.company}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                participant.participant.status === 'checked_in'
                  ? 'bg-green-100 text-green-700'
                  : participant.participant.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : participant.participant.status === 'registered'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
              }`}
            >
              {mapStatusToLabel(participant.participant.status)}
            </span>

            {(participant.vip_level || 0) > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <Crown className="h-3 w-3 mr-1" />
                {mapVipLevelToLabel(participant.vip_level)}
              </span>
            )}

            {participant.table && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <Table className="h-3 w-3 mr-1" />
                {participant.table.name}
              </span>
            )}

            {participant.is_checked_in && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                체크인 완료
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <OverviewTab event={event} participant={participant} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            participant={participant}
            profileData={profileData}
            onProfileDataChange={setProfileData}
            onSave={handleSaveProfile}
            isPending={isPending}
          />
        )}
        {activeTab === 'travel' && (
          <TravelTab
            participant={participant}
            travelData={travelData}
            onTravelDataChange={setTravelData}
            onSave={handleSaveTravel}
            isPending={isPending}
          />
        )}
        {activeTab === 'hotel' && (
          <HotelTab
            participant={participant}
            hotelData={hotelData}
            onHotelDataChange={setHotelData}
            onSave={handleSaveHotel}
            isPending={isPending}
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            notesData={notesData}
            onNotesDataChange={setNotesData}
            onSave={handleSaveNotes}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({
  event,
  participant,
}: {
  event: { id: string; code: string };
  participant: ParticipantExtended;
}) {
  return (
    <div className="space-y-4">
      {/* 상태 요약 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">참가자 상태</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">상태</span>
            <span className="text-sm font-medium text-gray-900">
              {mapStatusToLabel(participant.participant.status)}
            </span>
          </div>
          {(participant.vip_level || 0) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">VIP 레벨</span>
              <span className="text-sm font-medium text-amber-600">
                {mapVipLevelToLabel(participant.vip_level)}
              </span>
            </div>
          )}
          {participant.table && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">테이블</span>
              <span className="text-sm font-medium text-gray-900">{participant.table.name}</span>
            </div>
          )}
          {participant.is_checked_in && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">체크인</span>
              <span className="text-sm font-medium text-green-600">
                {participant.checked_in_at
                  ? new Date(participant.checked_in_at).toLocaleString('ko-KR')
                  : '완료'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 항공 요약 */}
      {participant.travel && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">항공 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participant.travel.is_travel_confirmed ? (
              <>
                {participant.travel.arrival_airport && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">도착 공항</span>
                    <span className="text-sm font-medium text-gray-900">
                      {participant.travel.arrival_airport}
                    </span>
                  </div>
                )}
                {participant.travel.arrival_flight_no && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">도착 항공편</span>
                    <span className="text-sm font-medium text-gray-900">
                      {participant.travel.arrival_flight_no}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    확정됨
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-amber-600">미확정</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 호텔 요약 */}
      {participant.hotel && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">호텔 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participant.hotel.check_in_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">체크인</span>
                <span className="text-sm font-medium text-gray-900">
                  {participant.hotel.check_in_date}
                </span>
              </div>
            )}
            {participant.hotel.check_out_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">체크아웃</span>
                <span className="text-sm font-medium text-gray-900">
                  {participant.hotel.check_out_date}
                </span>
              </div>
            )}
            {participant.hotel.is_hotel_confirmed ? (
              <div className="pt-2 border-t border-gray-200">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  확정됨
                </span>
              </div>
            ) : (
              <div className="text-sm text-amber-600">미확정</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/${event.code}/qr-pass`} target="_blank">
            <QrCode className="h-4 w-4 mr-2" />
            Open QR PASS
            <ExternalLink className="h-3 w-3 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/events/${event.id}/tables`}>
            <Table className="h-4 w-4 mr-2" />
            Open Table Assignment
          </Link>
        </Button>
        {(participant.vip_level || 0) > 0 && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/admin/events/${event.id}/vip`}>
              <Crown className="h-4 w-4 mr-2" />
              Open VIP Page
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/events/${event.id}/mail`}>
            <Mail className="h-4 w-4 mr-2" />
            Open Mail Center
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/events/${event.id}/participants/${participant.participant.id}/info`}>
            <Info className="h-4 w-4 mr-2" />
            Info Center
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({
  participant,
  profileData,
  onProfileDataChange,
  onSave,
  isPending,
}: {
  participant: ParticipantExtended;
  profileData: {
    company: string;
    position: string;
    mobile_phone: string;
    phone: string;
    dietary_restrictions: string;
    note: string;
  };
  onProfileDataChange: (data: typeof profileData) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <Input value={participant.participant.name} disabled className="bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <Input value={participant.participant.email} disabled className="bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사</label>
            <Input
              value={profileData.company}
              onChange={(e) => onProfileDataChange({ ...profileData, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
            <Input
              value={profileData.position}
              onChange={(e) => onProfileDataChange({ ...profileData, position: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <Input
              value={profileData.phone}
              onChange={(e) => onProfileDataChange({ ...profileData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">휴대전화</label>
            <Input
              value={profileData.mobile_phone}
              onChange={(e) => onProfileDataChange({ ...profileData, mobile_phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">식이제한</label>
            <Input
              value={profileData.dietary_restrictions}
              onChange={(e) =>
                onProfileDataChange({ ...profileData, dietary_restrictions: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              value={profileData.note}
              onChange={(e) => onProfileDataChange({ ...profileData, note: e.target.value })}
              className="w-full h-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="내부 메모..."
            />
          </div>
        </CardContent>
      </Card>

      <Button variant="primary" onClick={onSave} disabled={isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}

// Travel Tab
function TravelTab({
  participant,
  travelData,
  onTravelDataChange,
  onSave,
  isPending,
}: {
  participant: ParticipantExtended;
  travelData: {
    arrival_airport: string;
    arrival_date: string;
    arrival_time: string;
    arrival_flight: string;
    departure_airport: string;
    departure_date: string;
    departure_time: string;
    departure_flight: string;
    is_travel_confirmed: boolean;
  };
  onTravelDataChange: (data: typeof travelData) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">항공 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">도착 정보</h4>
            <div className="space-y-3">
              <Input
                label="도착 공항"
                value={travelData.arrival_airport}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, arrival_airport: e.target.value })
                }
              />
              <Input
                label="도착일"
                type="date"
                value={travelData.arrival_date}
                onChange={(e) => onTravelDataChange({ ...travelData, arrival_date: e.target.value })}
              />
              <Input
                label="도착 시간"
                type="time"
                value={travelData.arrival_time}
                onChange={(e) => onTravelDataChange({ ...travelData, arrival_time: e.target.value })}
              />
              <Input
                label="도착 항공편"
                value={travelData.arrival_flight}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, arrival_flight: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">출발 정보</h4>
            <div className="space-y-3">
              <Input
                label="출발 공항"
                value={travelData.departure_airport}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, departure_airport: e.target.value })
                }
              />
              <Input
                label="출발일"
                type="date"
                value={travelData.departure_date}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, departure_date: e.target.value })
                }
              />
              <Input
                label="출발 시간"
                type="time"
                value={travelData.departure_time}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, departure_time: e.target.value })
                }
              />
              <Input
                label="출발 항공편"
                value={travelData.departure_flight}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, departure_flight: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={travelData.is_travel_confirmed}
                onChange={(e) =>
                  onTravelDataChange({ ...travelData, is_travel_confirmed: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">항공 확정</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Button variant="primary" onClick={onSave} disabled={isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}

// Hotel Tab
function HotelTab({
  participant,
  hotelData,
  onHotelDataChange,
  onSave,
  isPending,
}: {
  participant: ParticipantExtended;
  hotelData: {
    hotel_check_in: string;
    hotel_check_out: string;
    room_preference: string;
    is_hotel_confirmed: boolean;
  };
  onHotelDataChange: (data: typeof hotelData) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">호텔 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="체크인 날짜"
            type="date"
            value={hotelData.hotel_check_in}
            onChange={(e) => onHotelDataChange({ ...hotelData, hotel_check_in: e.target.value })}
          />
          <Input
            label="체크아웃 날짜"
            type="date"
            value={hotelData.hotel_check_out}
            onChange={(e) => onHotelDataChange({ ...hotelData, hotel_check_out: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">객실 타입</label>
            <select
              value={hotelData.room_preference}
              onChange={(e) => onHotelDataChange({ ...hotelData, room_preference: e.target.value })}
              className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">선택</option>
              <option value="single">싱글</option>
              <option value="twin">트윈</option>
            </select>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hotelData.is_hotel_confirmed}
                onChange={(e) =>
                  onHotelDataChange({ ...hotelData, is_hotel_confirmed: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">호텔 확정</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Button variant="primary" onClick={onSave} disabled={isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}

// Notes Tab
function NotesTab({
  notesData,
  onNotesDataChange,
  onSave,
  isPending,
}: {
  notesData: { note: string };
  onNotesDataChange: (data: typeof notesData) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">내부 메모</CardTitle>
          <CardDescription>관리자 전용 메모입니다. 참가자에게는 표시되지 않습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notesData.note}
            onChange={(e) => onNotesDataChange({ note: e.target.value })}
            className="w-full h-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="내부 메모를 입력하세요..."
          />
        </CardContent>
      </Card>

      <Button variant="primary" onClick={onSave} disabled={isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}

