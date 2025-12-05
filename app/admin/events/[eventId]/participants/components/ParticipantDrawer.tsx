/**
 * Participant Drawer Component
 * 
 * Displays detailed participant information in a side drawer with 5 sections:
 * 1. Basic Info
 * 2. Registration Info
 * 3. On-site Status
 * 4. Assignment
 * 5. Activity History
 */

'use client';

import { useEffect } from 'react';
import { X, Mail, Building2, Calendar, Table, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types/participants';
import { getAssignmentStatus, getCheckInLabel } from '@/lib/utils/participants';
import { getRelativeTime } from '@/lib/utils/date';

interface ParticipantDrawerProps {
  participant: Participant | null;
  eventId: string;
  onClose: () => void;
}

export function ParticipantDrawer({ participant, eventId, onClose }: ParticipantDrawerProps) {
  useEffect(() => {
    if (participant) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [participant]);

  if (!participant) return null;

  const assignment = getAssignmentStatus(participant);
  const checkInLabel = getCheckInLabel(participant);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">참가자 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">이름</label>
                  <p className="text-sm text-gray-900 mt-1">{participant.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">이메일</label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {participant.email}
                  </p>
                </div>
                {participant.company && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">회사</label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {participant.company}
                    </p>
                  </div>
                )}
                {(participant.title || participant.position) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">직책</label>
                    <p className="text-sm text-gray-900 mt-1">{participant.title || participant.position}</p>
                  </div>
                )}
                {(participant.is_vip || participant.vip) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">VIP</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        VIP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Registration Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">등록 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">상태</label>
                  <div className="mt-1">
                    <StatusBadge status={participant.status} />
                  </div>
                </div>
                {participant.registered_at && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">등록일시</label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(participant.registered_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
                {participant.registration_source && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">등록 경로</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {participant.registration_source === 'form'
                        ? '폼 제출'
                        : participant.registration_source === 'import'
                        ? '일괄 등록'
                        : participant.registration_source === 'admin'
                        ? '관리자 등록'
                        : '기타'}
                    </p>
                  </div>
                )}
                {(participant.email_bounced || participant.email_opened !== undefined) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">이메일 상태</label>
                    <div className="mt-1 flex items-center gap-2">
                      {participant.email_bounced && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          Bounced
                        </span>
                      )}
                      {participant.email_opened && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Opened
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: On-site Status */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">현장 상태</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">체크인</label>
                  <p className="text-sm text-gray-900 mt-1">{checkInLabel}</p>
                </div>
                {participant.checked_in_at && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">체크인 시간</label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(participant.checked_in_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Assignment */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">테이블 배정</h3>
              <div className="space-y-3">
                {assignment.isConflict ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      배정 충돌
                    </div>
                    <p className="text-xs text-red-600">
                      이 참가자의 테이블 배정에 충돌이 있습니다. 테이블 배정 페이지에서 확인하세요.
                    </p>
                  </div>
                ) : assignment.isUnassigned ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Table className="w-4 h-4" />
                      <span>테이블이 배정되지 않았습니다.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">테이블</label>
                      <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                        <Table className="w-4 h-4 text-gray-400" />
                        {participant.table_name || `Table ${participant.table_id?.slice(-4) || ''}`}
                      </p>
                    </div>
                    {participant.seat_number && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">좌석 번호</label>
                        <p className="text-sm text-gray-900 mt-1">{participant.seat_number}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Activity History */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">활동 이력</h3>
              <div className="space-y-2">
                {participant.last_mail_sent_at && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">이메일 발송:</span>{' '}
                    {getRelativeTime(participant.last_mail_sent_at)}
                  </div>
                )}
                {participant.registered_at && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">등록:</span> {getRelativeTime(participant.registered_at)}
                  </div>
                )}
                {participant.checked_in_at && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">체크인:</span> {getRelativeTime(participant.checked_in_at)}
                  </div>
                )}
                {!participant.last_mail_sent_at &&
                  !participant.registered_at &&
                  !participant.checked_in_at && (
                    <p className="text-sm text-gray-500 text-center py-4">최근 활동이 없습니다.</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <a href={`/admin/events/${eventId}/participants/${participant.id}/edit`} className="w-full">
            <Button variant="primary" className="w-full">
              상세 편집
            </Button>
          </a>
        </div>
      </div>
    </>
  );
}
