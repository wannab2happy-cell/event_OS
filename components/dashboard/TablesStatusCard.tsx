/**
 * Tables Status Card Component
 * 
 * Displays table assignment statistics
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface TablesStatusCardProps {
  totalTables?: number;
  assignedSeats?: number;
  totalCapacity?: number;
}

export default function TablesStatusCard({
  totalTables = 25,
  assignedSeats = 180,
  totalCapacity = 250,
}: TablesStatusCardProps) {
  const percentage = totalCapacity > 0 ? Math.round((assignedSeats / totalCapacity) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tables Status</CardTitle>
        <CardDescription>Seat assignment overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Tables</span>
            <span className="font-semibold">{totalTables}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assigned Seats</span>
            <span className="font-semibold">
              {assignedSeats} / {totalCapacity}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assignment Rate</span>
            <span className="font-semibold">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

