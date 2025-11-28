'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { User, FileText, Plane, Hotel, QrCode, Crown, CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateSelfProfileAction } from '@/actions/participantSelf/updateProfile';
import toast from 'react-hot-toast';
import type { Participant, Event, ParticipantStatusSummary, ParticipantTravelSummary, ParticipantHotelSummary } from '@/lib/types';

interface ParticipantPortalClientProps {
  event: Event;
  participant: Participant;
  statusSummary: ParticipantStatusSummary;
  travelSummary: ParticipantTravelSummary;
  hotelSummary: ParticipantHotelSummary;
}

type TabType = 'overview' | 'profile' | 'travel' | 'pass';

export default function ParticipantPortalClient({
  event,
  participant,
  statusSummary,
  travelSummary,
  hotelSummary,
}: ParticipantPortalClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPending, startTransition] = useTransition();

  // Profile 폼 상태
  const [profileData, setProfileData] = useState({
    company: participant.company || '',
    position: participant.position || '',
    phone: participant.phone || '',
    mobilePhone: (participant as any).mobile_phone || '',
    dietary: (participant as any).dietary_restrictions || '',
    note: (participant as any).note || '',
  });

  const handleProfileUpdate = () => {
    startTransition(async () => {
      try {
        const result = await updateSelfProfileAction({
          eventId: event.id,
          company: profileData.company || undefined,
          jobTitle: profileData.position || undefined,
          phone: profileData.phone || undefined,
          mobilePhone: profileData.mobilePhone || undefined,
          dietary: profileData.dietary || undefined,
          note: profileData.note || undefined,
        });

        if (result.ok) {
          toast.success('정보가 저장되었습니다.');
        } else {
          toast.error('정보 저장에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('Profile update error:', error);
        toast.error(error.message || '정보 저장 중 오류가 발생했습니다.');
      }
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'profile' as TabType, label: 'Profile', icon: FileText },
    { id: 'travel' as TabType, label: 'Travel & Hotel', icon: Plane },
    { id: 'pass' as TabType, label: 'My PASS', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-lg text-gray-600">Your event profile</p>
          <div className="flex items-center gap-3 mt-4">
            <h2 className="text-xl font-semibold text-gray-900">{participant.name}</h2>
            {statusSummary.isVip && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
                <Crown className="h-4 w-4" />
                {statusSummary.vipLabel}
              </span>
            )}
            {participant.company && (
              <span className="text-gray-600">{participant.company}</span>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {/* Overview 탭 */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 참가자 상태 카드 */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">참가자 상태</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 상태 */}
                  <div>
                    <label className="text-xs font-medium text-gray-500">상태</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {statusSummary.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* 체크인 */}
                  <div>
                    <label className="text-xs font-medium text-gray-500">체크인</label>
                    <div className="flex items-center gap-2 mt-1">
                      {statusSummary.isCheckedIn ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-600">체크인 완료</span>
                          {statusSummary.checkedInAt && (
                            <span className="text-xs text-gray-500">
                              ({formatDateTime(statusSummary.checkedInAt)})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">아직 체크인 전</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 테이블 */}
                  <div>
                    <label className="text-xs font-medium text-gray-500">테이블</label>
                    {statusSummary.tableName ? (
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {statusSummary.tableName}
                        {statusSummary.seatNumber && ` (Seat ${statusSummary.seatNumber})`}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-1">배정되지 않았습니다.</p>
                    )}
                  </div>

                  {/* VIP */}
                  <div>
                    <label className="text-xs font-medium text-gray-500">VIP</label>
                    {statusSummary.isVip ? (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                          <Crown className="h-3 w-3" />
                          {statusSummary.vipLabel}
                        </span>
                        {statusSummary.guestOfName && (
                          <p className="text-xs text-gray-500 mt-1">Guest of: {statusSummary.guestOfName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">일반 참가자</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 예약/배정 상태 요약 카드 */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">예약/배정 상태 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 항공 정보 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-4 w-4 text-blue-600" />
                      <label className="text-xs font-medium text-gray-500">항공</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{travelSummary.travelStatusLabel}</p>
                  </div>

                  {/* 호텔 정보 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Hotel className="h-4 w-4 text-green-600" />
                      <label className="text-xs font-medium text-gray-500">호텔</label>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{hotelSummary.hotelStatusLabel}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      항공 및 호텔 정보는 아래 탭에서 상세히 확인할 수 있습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile 탭 */}
          {activeTab === 'profile' && (
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">프로필 정보</CardTitle>
                <CardDescription>기본 정보를 확인하고 수정할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 읽기 전용 필드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="이름"
                      value={participant.name}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      이름/이메일 변경이 필요하면 운영팀에 문의해 주세요.
                    </p>
                  </div>
                  <div>
                    <Input
                      label="이메일"
                      value={participant.email}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* 수정 가능 필드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="회사"
                      value={profileData.company}
                      onChange={(e) =>
                        setProfileData({ ...profileData, company: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="직책/직무"
                      value={profileData.position}
                      onChange={(e) =>
                        setProfileData({ ...profileData, position: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="휴대전화"
                      value={profileData.mobilePhone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, mobilePhone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Input
                      label="연락처(회사/집)"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    식이 제한 / 알레르기
                  </label>
                  <textarea
                    value={profileData.dietary}
                    onChange={(e) => setProfileData({ ...profileData, dietary: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="알레르기, 채식 등 특별한 식이 요구사항을 입력하세요."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영팀에 전달할 메모
                  </label>
                  <textarea
                    value={profileData.note}
                    onChange={(e) => setProfileData({ ...profileData, note: e.target.value })}
                    rows={4}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="추가 정보나 요청사항을 입력하세요."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    취소
                  </Button>
                  <Button onClick={handleProfileUpdate} disabled={isPending}>
                    {isPending ? '저장 중...' : '변경 내용 저장'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Travel & Hotel 탭 */}
          {activeTab === 'travel' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                행사 운영팀이 예약한 항공/호텔 정보를 확인할 수 있습니다.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {/* 항공 정보 카드 */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      항공 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {travelSummary.hasTravel ? (
                      <>
                        {travelSummary.arrivalDate && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">도착</label>
                            <p className="text-sm text-gray-900 mt-1">
                              {travelSummary.departureCity || '-'} → {travelSummary.arrivalCity || '-'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              날짜: {formatDateShort(travelSummary.arrivalDate)}
                            </p>
                            {travelSummary.arrivalFlight && (
                              <p className="text-xs text-gray-600">항공편: {travelSummary.arrivalFlight}</p>
                            )}
                          </div>
                        )}
                        {travelSummary.departureDate && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">출발</label>
                            <p className="text-sm text-gray-900 mt-1">
                              {travelSummary.arrivalCity || '-'} → {travelSummary.departureCity || '-'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              날짜: {formatDateShort(travelSummary.departureDate)}
                            </p>
                            {travelSummary.departureFlight && (
                              <p className="text-xs text-gray-600">항공편: {travelSummary.departureFlight}</p>
                            )}
                          </div>
                        )}
                        {travelSummary.flightTicketNo && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">항공권 번호</label>
                            <p className="text-sm text-gray-900">{travelSummary.flightTicketNo}</p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            자세한 변경이 필요하면 운영팀에 문의해 주세요.
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">등록된 항공 정보가 없습니다.</p>
                    )}
                  </CardContent>
                </Card>

                {/* 호텔 정보 카드 */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hotel className="h-5 w-5 text-green-600" />
                      호텔 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hotelSummary.hasHotel ? (
                      <>
                        {hotelSummary.hotelName && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">호텔명</label>
                            <p className="text-sm text-gray-900 mt-1">{hotelSummary.hotelName}</p>
                          </div>
                        )}
                        {(hotelSummary.checkInDate || hotelSummary.checkOutDate) && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">일정</label>
                            <p className="text-sm text-gray-900 mt-1">
                              {formatDateShort(hotelSummary.checkInDate)} ~ {formatDateShort(hotelSummary.checkOutDate)}
                            </p>
                          </div>
                        )}
                        {hotelSummary.roomType && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">객실 타입</label>
                            <p className="text-sm text-gray-900 mt-1">{hotelSummary.roomType}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-500">상태</label>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                hotelSummary.isConfirmed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : hotelSummary.hasHotel
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {hotelSummary.hotelStatusLabel}
                            </span>
                          </div>
                        </div>
                        {hotelSummary.guestConfirmationNo && (
                          <div>
                            <label className="text-xs font-medium text-gray-500">확정 번호</label>
                            <p className="text-sm text-gray-900">{hotelSummary.guestConfirmationNo}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">호텔이 아직 배정되지 않았습니다.</p>
                    )}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        정보 변경이 필요하시면 운영팀에 문의해 주세요.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* My PASS 탭 */}
          {activeTab === 'pass' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                이 행사에서 사용하실 입장 PASS입니다.
              </p>
              {statusSummary.isVip && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  VIP 전용 좌석 및 라운지 안내는 현장에서 별도로 제공됩니다.
                </p>
              )}

              {/* PASS 요약 카드 */}
              <div className="rounded-2xl border bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      My Event PASS
                    </p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {participant.name}
                      {statusSummary.isVip && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          VIP
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {participant.company || '회사 정보 없음'}
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-500">
                        테이블: {statusSummary.tableName || '미배정'}{' '}
                        {statusSummary.seatNumber ? `· 좌석 ${statusSummary.seatNumber}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        체크인 상태:{' '}
                        {statusSummary.isCheckedIn ? (
                          <span className="text-emerald-600 font-medium">체크인 완료</span>
                        ) : (
                          <span className="text-gray-600">아직 체크인 전</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="rounded-xl border bg-gray-50 px-4 py-3 text-right text-xs text-gray-600">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">
                        행사 정보
                      </div>
                      <div className="text-xs font-semibold mt-1">{event.title}</div>
                      {event.start_date && event.end_date && (
                        <div className="text-[11px] mt-1">
                          {formatDateShort(event.start_date)} ~ {formatDateShort(event.end_date)}
                        </div>
                      )}
                      {event.venue_name && (
                        <div className="text-[11px] mt-1">{event.venue_name}</div>
                      )}
                    </div>
                    <Button asChild size="sm" className="w-full sm:w-auto">
                      <Link href={`/${event.code || event.id}/qr-pass`}>
                        QR PASS 전체 화면 열기
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
