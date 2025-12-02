'use client';

import React from 'react';
import { Calendar, MapPin, Users, User, Building2, Crown } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location_name?: string | null;
}

interface ParticipantData {
  id: string;
  name: string;
  company_name?: string | null;
  is_vip?: boolean;
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
}

interface MyTableClientProps {
  event: EventData;
  participant: ParticipantData;
  table: TableData | null;
}

export default function MyTableClient({ event, participant, table }: MyTableClientProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
        {/* Event Summary Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 md:p-6 text-white">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              {event.title}
            </h1>
            <div className="space-y-2.5 text-sm md:text-base opacity-95">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div>
                    {formatDate(event.start_date)}
                    {event.start_date !== event.end_date && (
                      <span className="ml-1">~ {formatDate(event.end_date)}</span>
                    )}
                  </div>
                  {event.start_date && (
                    <div className="text-xs opacity-90 mt-1">
                      {formatTime(event.start_date)}
                      {event.end_date && event.start_date !== event.end_date && (
                        <span> ~ {formatTime(event.end_date)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {event.location_name && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{event.location_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participant Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">내 정보</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-gray-600 text-sm md:text-base">이름</span>
              <span className="font-medium text-gray-900 text-sm md:text-base text-right">
                {participant.name}
              </span>
            </div>
            {participant.company_name && (
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-gray-600 text-sm md:text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  회사
                </span>
                <span className="font-medium text-gray-900 text-sm md:text-base text-right">
                  {participant.company_name}
                </span>
              </div>
            )}
            {participant.is_vip && (
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-700 text-sm md:text-base">VIP 참가자</span>
              </div>
            )}
          </div>
        </div>

        {/* Table Assignment Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">내 테이블</h2>
          </div>

          {!table ? (
            <div className="text-center py-8 md:py-10">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2 text-sm md:text-base">
                아직 테이블 배정이 확정되지 않았습니다
              </p>
              <p className="text-gray-500 text-xs md:text-sm px-4">
                배정이 완료되면 이 페이지에서 확인하실 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 md:p-6 border-2 border-green-200">
                <div className="text-center mb-4">
                  <div className="inline-block p-3 bg-green-500 rounded-full mb-3">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{table.name}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">테이블 배정 완료</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>수용 인원: {table.capacity}명</span>
                </div>
              </div>

              {/* Additional Info Placeholder */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs md:text-sm">
                  * 동석자 정보 및 좌석 배치는 행사 당일 안내됩니다
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Additional Features Placeholder */}
        <div className="text-center text-gray-400 text-xs md:text-sm space-y-2 pt-4">
          <p className="font-medium">ANDERS Event Management System</p>
          <p className="text-gray-300 text-xs">
            * QR 코드 및 추가 기능은 이후 확장 예정입니다
          </p>
        </div>
    </div>
  );
}

