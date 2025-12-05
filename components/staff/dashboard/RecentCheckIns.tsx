/**
 * Recent Check-ins Component
 * 
 * Displays a list of recent check-ins
 */

'use client';

import { Crown, Table, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RecentCheckIn } from '@/actions/staff/getRecentCheckIns';
import { getRelativeTime } from '@/lib/utils/date';

interface RecentCheckInsProps {
  checkIns: RecentCheckIn[];
  onParticipantClick?: (participantId: string) => void;
}

export default function RecentCheckIns({ checkIns, onParticipantClick }: RecentCheckInsProps) {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No check-ins yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-ins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onParticipantClick?.(checkIn.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{checkIn.name}</p>
                  {checkIn.vip && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                </div>
                {checkIn.company && (
                  <p className="text-sm text-muted-foreground truncate">{checkIn.company}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {checkIn.table_name && checkIn.seat_number ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Table className="w-3 h-3" />
                      <span>
                        Table {checkIn.table_name} · Seat {checkIn.seat_number}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No table assigned</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{getRelativeTime(checkIn.checked_in_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

