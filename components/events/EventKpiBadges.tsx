/**
 * Event KPI Badges Component
 * 
 * Displays small KPI badges for an event
 */

'use client';

import { Users, CheckCircle2, Mail, Table } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { EventKPIs } from '@/lib/events/eventKpiUtils';

interface EventKpiBadgesProps {
  kpis: EventKPIs;
}

export default function EventKpiBadges({ kpis }: EventKpiBadgesProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="default" className="flex items-center gap-1 text-xs">
        <Users className="w-3 h-3" />
        {kpis.registrationsCount} registered
      </Badge>
      <Badge variant="default" className="flex items-center gap-1 text-xs">
        <CheckCircle2 className="w-3 h-3" />
        {kpis.checkedInCount} checked in
      </Badge>
      <Badge variant="default" className="flex items-center gap-1 text-xs">
        <Mail className="w-3 h-3" />
        {kpis.mailOpenRate}% open
      </Badge>
      <Badge variant="default" className="flex items-center gap-1 text-xs">
        <Table className="w-3 h-3" />
        {kpis.tableAssignmentRate}% assigned
      </Badge>
    </div>
  );
}

