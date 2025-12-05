/**
 * Event Dashboard Header Component
 * 
 * Displays event name, date range, location, and status
 */

import { Badge } from '@/components/ui/Badge';

interface EventDashboardHeaderProps {
  eventName: string;
  dateRangeText: string;
  location?: string;
  status: 'planning' | 'active' | 'archived';
  actions?: React.ReactNode;
}

export default function EventDashboardHeader({
  eventName,
  dateRangeText,
  location,
  status,
  actions,
}: EventDashboardHeaderProps) {
  const statusLabels = {
    planning: '계획 중',
    active: '진행 중',
    archived: '완료',
  };

  const statusVariants = {
    planning: 'info' as const,
    active: 'success' as const,
    archived: 'default' as const,
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{eventName}</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm md:text-base text-muted-foreground">
          <span>{dateRangeText}</span>
          {location && (
            <>
              <span className="hidden md:inline">•</span>
              <span>{location}</span>
            </>
          )}
          <Badge variant={statusVariants[status]} className="w-fit">
            {statusLabels[status]}
          </Badge>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

