/**
 * Participant Result Component
 * 
 * Displays check-in result with participant information
 */

'use client';

import { CheckCircle2, AlertCircle, XCircle, Crown, Table } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ResultBadge from './ResultBadge';
import type { Participant } from '@/lib/types/participants';

interface CheckInResult {
  success: boolean;
  status: 'checked_in' | 'already_checked_in' | 'not_found' | 'error';
  participant?: Participant;
  error?: string;
}

interface ParticipantResultProps {
  data: CheckInResult;
}

export default function ParticipantResult({ data }: ParticipantResultProps) {
  if (!data.participant && data.status !== 'not_found' && data.status !== 'error') {
    return null;
  }

  const getStatusConfig = () => {
    switch (data.status) {
      case 'checked_in':
        return {
          icon: CheckCircle2,
          badge: <ResultBadge status="success">Checked In</ResultBadge>,
          title: 'Check-in Successful',
          color: 'text-emerald-600',
        };
      case 'already_checked_in':
        return {
          icon: AlertCircle,
          badge: <ResultBadge status="warning">Already Checked In</ResultBadge>,
          title: 'Already Checked In',
          color: 'text-yellow-600',
        };
      case 'not_found':
        return {
          icon: XCircle,
          badge: <ResultBadge status="error">Not Found</ResultBadge>,
          title: 'Participant Not Found',
          color: 'text-red-600',
        };
      case 'error':
        return {
          icon: XCircle,
          badge: <ResultBadge status="error">Error</ResultBadge>,
          title: 'Check-in Failed',
          color: 'text-red-600',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  const { icon: Icon, badge, title, color } = statusConfig;
  const participant = data.participant;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            {title}
          </CardTitle>
          {badge}
        </div>
      </CardHeader>
      {participant && (
        <CardContent className="space-y-4">
          {/* Participant Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{participant.name}</h3>
              {participant.vip && (
                <Crown className="w-5 h-5 text-yellow-500" title="VIP" />
              )}
            </div>
            {participant.email && (
              <p className="text-sm text-muted-foreground">{participant.email}</p>
            )}
            {participant.company && (
              <p className="text-sm text-muted-foreground">{participant.company}</p>
            )}
          </div>

          {/* Table Assignment */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Table className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Table Assignment:</span>
              {participant.table_name && participant.seat_number ? (
                <span className="font-medium">
                  Table {participant.table_name} · Seat {participant.seat_number}
                </span>
              ) : (
                <span className="text-muted-foreground">No table assigned</span>
              )}
            </div>
          </div>

          {/* Check-in Time */}
          {participant.checked_in_at && (
            <div className="pt-2 text-xs text-muted-foreground">
              Checked in at: {new Date(participant.checked_in_at).toLocaleString()}
            </div>
          )}
        </CardContent>
      )}
      {!participant && (data.status === 'not_found' || data.status === 'error') && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.error || 'Participant not found for this event.'}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

