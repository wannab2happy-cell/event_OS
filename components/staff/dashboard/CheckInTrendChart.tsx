/**
 * Check-in Trend Chart Component
 * 
 * Displays check-in trend using Recharts
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CheckInTrendPoint } from '@/actions/staff/getCheckInTrend';

interface CheckInTrendChartProps {
  data: CheckInTrendPoint[];
}

export default function CheckInTrendChart({ data }: CheckInTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="interval"
                tick={{ fontSize: 12 }}
                label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
              />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
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

