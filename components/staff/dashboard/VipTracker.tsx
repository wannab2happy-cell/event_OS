/**
 * VIP Tracker Component
 * 
 * Displays VIP list with arrival status
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Crown, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getVipList } from '@/actions/staff/getVipList';
import type { VipParticipant } from '@/actions/staff/getVipList';

interface VipTrackerProps {
  eventId: string;
  onParticipantClick?: (participantId: string) => void;
}

export default function VipTracker({ eventId, onParticipantClick }: VipTrackerProps) {
  const [vips, setVips] = useState<VipParticipant[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const vipList = await getVipList(eventId);
      setVips(vipList);
    });
  }, [eventId]);

  if (vips.length === 0 && !isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            VIP Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No VIP participants</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          VIP Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {vips.map((vip: any) => (
            <div
              key={vip.id}
              className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onParticipantClick?.(vip.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{vip.name}</p>
                  {vip.company && <p className="text-xs text-muted-foreground truncate">{vip.company}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {vip.table_name && (
                  <span className="text-xs text-muted-foreground">Table {vip.table_name}</span>
                )}
                {vip.checked_in ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Arrived
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Not Arrived
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

