'use client';

import { useEffect } from 'react';
import { X, Mail, Building2, Calendar, Plane, Hotel, Table, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types';

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] bg-white shadow-xl z-50 flex flex-col">
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
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
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
              {participant.position && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">직책</label>
                  <p className="text-sm text-gray-900 mt-1">{participant.position}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">상태</label>
                <div className="mt-1">
                  <StatusBadge status={participant.status} />
                </div>
              </div>
              {participant.is_vip && (
                <div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    VIP
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">등록 정보</h3>
            <div className="space-y-3">
              {participant.created_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">등록일</label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(participant.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">확정 상태</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Plane className={`w-4 h-4 ${participant.is_travel_confirmed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${participant.is_travel_confirmed ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      항공 {participant.is_travel_confirmed ? '확정' : '미확정'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hotel className={`w-4 h-4 ${participant.is_hotel_confirmed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${participant.is_hotel_confirmed ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                      호텔 {participant.is_hotel_confirmed ? '확정' : '미확정'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Assignment (Placeholder) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">테이블 배정</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Table className="w-4 h-4" />
                <span>테이블 배정 정보는 테이블 배정 페이지에서 확인할 수 있습니다.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <a
            href={`/admin/events/${eventId}/participants/${participant.id}/edit`}
            className="w-full"
          >
            <Button variant="primary" className="w-full">
              <Edit3 className="w-4 h-4 mr-2" />
              상세 편집
            </Button>
          </a>
        </div>
      </div>
    </>
  );
}

