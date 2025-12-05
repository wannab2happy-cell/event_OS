/**
 * Registration Trend Card Component
 * 
 * Displays registration trend chart using Recharts
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface RegistrationDataPoint {
  date: string;
  value: number;
}

interface RegistrationTrendCardProps {
  data?: RegistrationDataPoint[];
}

const defaultData: RegistrationDataPoint[] = [
  { date: '2024-01-01', value: 10 },
  { date: '2024-01-05', value: 25 },
  { date: '2024-01-10', value: 45 },
  { date: '2024-01-15', value: 60 },
  { date: '2024-01-20', value: 85 },
  { date: '2024-01-25', value: 110 },
  { date: '2024-01-30', value: 135 },
];

export default function RegistrationTrendCard({ data = defaultData }: RegistrationTrendCardProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Trend</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

