'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FailureReasonStats } from '@/lib/mail/types';

interface FailureReasonsChartProps {
  reasons: FailureReasonStats[];
}

const getReasonLabel = (reason: string): string => {
  const labels: Record<string, string> = {
    timeout: 'Timeout',
    invalid_email: 'Invalid Email',
    blocked: 'Blocked/Bounced',
    rate_limit: 'Rate Limit',
    api_error: 'API Error',
    other: 'Other',
    unknown: 'Unknown',
  };
  return labels[reason] || reason;
};

export function FailureReasonsChart({ reasons }: FailureReasonsChartProps) {
  if (reasons.length === 0) {
    return (
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Failure Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">No failure data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = reasons.map((r) => ({
    reason: getReasonLabel(r.reason),
    count: r.count,
    percentage: r.percentage.toFixed(1),
  }));

  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-700">Failure Reasons</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="reason" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ef4444" name="Count" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1">
          {reasons.map((r) => (
            <div key={r.reason} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{getReasonLabel(r.reason)}:</span>
              <span className="font-medium text-gray-900">
                {r.count} ({r.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}




