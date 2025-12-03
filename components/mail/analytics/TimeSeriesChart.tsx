'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { TimeSeriesPoint } from '@/lib/mail/types';

interface TimeSeriesChartProps {
  timeSeries: TimeSeriesPoint[];
}

export function TimeSeriesChart({ timeSeries }: TimeSeriesChartProps) {
  if (timeSeries.length === 0) {
    return (
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Time Series (Hourly)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">No time series data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format hour labels for display
  const chartData = timeSeries.map((point) => {
    const date = new Date(point.hour);
    const hourLabel = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    return {
      ...point,
      hourLabel,
    };
  });

  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-700">Time Series (Hourly)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hourLabel" 
              angle={-45}
              textAnchor="end"
              height={100}
              style={{ fontSize: '11px' }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="success" stackId="1" stroke="#10b981" fill="#10b981" name="Success" />
            <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" name="Failed" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

