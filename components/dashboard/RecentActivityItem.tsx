/**
 * Recent Activity Item Component
 * 
 * Displays a single activity item
 */

import { getRelativeTime } from '@/lib/utils/date';

export interface RecentActivityItemProps {
  title: string;
  description: string;
  relativeTime: string;
  type?: 'mail' | 'registration' | 'checkin' | 'table' | 'other';
}

export default function RecentActivityItem({
  title,
  description,
  relativeTime,
  type,
}: RecentActivityItemProps) {
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
        {relativeTime}
      </div>
    </div>
  );
}

