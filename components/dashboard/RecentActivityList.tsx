/**
 * Recent Activity List Component
 * 
 * Displays a list of recent activities
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import RecentActivityItem, { type RecentActivityItemProps } from './RecentActivityItem';

interface RecentActivityListProps {
  activities: RecentActivityItemProps[];
}

export default function RecentActivityList({ activities }: RecentActivityListProps) {
  const displayActivities = activities.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length > 0 ? (
          <div className="space-y-0">
            {displayActivities.map((activity, index) => (
              <RecentActivityItem key={index} {...activity} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}

