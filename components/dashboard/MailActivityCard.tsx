/**
 * Mail Activity Card Component
 * 
 * Displays mail activity chart (sent jobs per day, opens vs deliveries)
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface MailActivityDataPoint {
  date: string;
  sent: number;
  opened?: number;
  delivered?: number;
}

interface MailActivityCardProps {
  data?: MailActivityDataPoint[];
}

const defaultData: MailActivityDataPoint[] = [
  { date: '2024-01-01', sent: 50, opened: 35, delivered: 48 },
  { date: '2024-01-05', sent: 120, opened: 95, delivered: 118 },
  { date: '2024-01-10', sent: 80, opened: 62, delivered: 78 },
  { date: '2024-01-15', sent: 150, opened: 120, delivered: 147 },
  { date: '2024-01-20', sent: 200, opened: 165, delivered: 195 },
  { date: '2024-01-25', sent: 180, opened: 145, delivered: 176 },
  { date: '2024-01-30', sent: 220, opened: 180, delivered: 215 },
];

export default function MailActivityCard({ data = defaultData }: MailActivityCardProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mail Activity</CardTitle>
        <CardDescription>Sent jobs and engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                stroke="currentColor"
              />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sent" fill="hsl(var(--primary))" name="Sent" />
              {formattedData.some((d) => d.opened !== undefined) && (
                <Bar dataKey="opened" fill="hsl(var(--primary) / 0.7)" name="Opened" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

