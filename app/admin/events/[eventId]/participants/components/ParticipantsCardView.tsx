'use client';

import Link from 'next/link';
import { Edit3, Mail, Building2, Plane, Hotel } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';
import type { Participant } from '@/lib/types';

interface ParticipantsCardViewProps {
  participants: Participant[];
  eventId: string;
  onParticipantClick: (participant: Participant) => void;
}

export function ParticipantsCardView({ participants, eventId, onParticipantClick }: ParticipantsCardViewProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>참가자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {participants.map((participant) => (
        <Card
          key={participant.id}
          onClick={() => onParticipantClick(participant)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{participant.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{participant.email}</span>
                </div>
                {participant.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{participant.company}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={participant.status} />
              <div className="flex items-center gap-1">
                {participant.is_travel_confirmed && (
                  <span className="p-1 rounded-full bg-green-500" title="항공 확정">
                    <Plane className="w-3 h-3 text-white" />
                  </span>
                )}
                {participant.is_hotel_confirmed && (
                  <span className="p-1 rounded-full bg-green-500" title="호텔 확정">
                    <Hotel className="w-3 h-3 text-white" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              {participant.is_vip && (
                <span className="text-xs font-semibold text-red-600">VIP</span>
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
      ))}
    </div>
  );
}




