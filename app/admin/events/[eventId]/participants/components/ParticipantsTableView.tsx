/**
 * Participants Table View Component
 * 
 * Displays participants in a table format with columns:
 * Name, Company, Email, Registration Status, Assignment Status, Check-in, Actions
 */

'use client';

import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types/participants';
import { getAssignmentStatus, getCheckInLabel } from '@/lib/utils/participants';

interface ParticipantsTableViewProps {
  participants: Participant[];
  eventId: string;
  onParticipantClick: (participant: Participant) => void;
}

export function ParticipantsTableView({
  participants,
  eventId,
  onParticipantClick,
}: ParticipantsTableViewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록 상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                배정 상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                체크인
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  참가자가 없습니다.
                </td>
              </tr>
            ) : (
              participants.map((participant) => {
                const assignment = getAssignmentStatus(participant);
                const checkInLabel = getCheckInLabel(participant);

                return (
                  <tr
                    key={participant.id}
                    onClick={() => onParticipantClick(participant)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.company ?? '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{participant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.isConflict ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Conflict
                        </span>
                      ) : assignment.isUnassigned ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Unassigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {assignment.text}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{checkInLabel}</div>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
