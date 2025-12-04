'use client';

import Link from 'next/link';
import { MoreVertical, Plane, Hotel, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types';

interface ParticipantsTableViewProps {
  participants: Participant[];
  eventId: string;
  onParticipantClick: (participant: Participant) => void;
}

export function ParticipantsTableView({ participants, eventId, onParticipantClick }: ParticipantsTableViewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름 / 이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                소속 / 직책
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                확정
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  참가자가 없습니다.
                </td>
              </tr>
            ) : (
              participants.map((participant) => (
                <tr
                  key={participant.id}
                  onClick={() => onParticipantClick(participant)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{participant.company ?? '-'}</div>
                    <div className="text-sm text-gray-500">{participant.position ?? '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={participant.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                      <span
                        className={`p-1 rounded-full ${
                          participant.is_travel_confirmed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title="항공 확정"
                      >
                        <Plane className="w-3 h-3 text-white" />
                      </span>
                      <span
                        className={`p-1 rounded-full ${
                          participant.is_hotel_confirmed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title="호텔 확정"
                      >
                        <Hotel className="w-3 h-3 text-white" />
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/admin/events/${eventId}/participants/${participant.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4 mr-1" />
                        관리
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




