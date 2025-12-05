/**
 * Participants Card View Component
 * 
 * Displays participants in a card grid format optimized for mobile
 */

'use client';

import Link from 'next/link';
import { Edit3, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types/participants';
import { getAssignmentStatus } from '@/lib/utils/participants';

interface ParticipantsCardViewProps {
  participants: Participant[];
  eventId: string;
  onParticipantClick: (participant: Participant) => void;
}

export function ParticipantsCardView({
  participants,
  eventId,
  onParticipantClick,
}: ParticipantsCardViewProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>참가자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {participants.map((participant) => {
        const assignment = getAssignmentStatus(participant);

        return (
          <Card
            key={participant.id}
            onClick={() => onParticipantClick(participant)}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              {/* Name (prominent) */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{participant.name}</h3>
                {participant.company && (
                  <div className="text-sm text-gray-600 mb-1">{participant.company}</div>
                )}
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StatusBadge status={participant.status} />
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
              </div>

              {/* Email (lower importance) */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Mail className="w-3 h-3" />
                <span className="truncate">{participant.email}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                {participant.is_vip || participant.vip ? (
                  <span className="text-xs font-semibold text-red-600">VIP</span>
                ) : (
                  <span></span>
                )}
                <Link
                  href={`/admin/events/${eventId}/participants/${participant.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4 mr-1" />
                    관리
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
