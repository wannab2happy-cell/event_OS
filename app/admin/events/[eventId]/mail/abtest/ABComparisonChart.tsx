/**
 * AB Comparison Chart Component (Phase 4)
 * 
 * Bar chart comparing AB test variants
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ABTestResult } from '@/lib/mail/types';

interface ABComparisonChartProps {
  variantA: ABTestResult;
  variantB: ABTestResult;
}

export default function ABComparisonChart({ variantA, variantB }: ABComparisonChartProps) {
  const data = [
    {
      name: 'Version A',
      sent: variantA.total,
      opened: variantA.successCount,
      bounced: variantA.failCount,
    },
    {
      name: 'Version B',
      sent: variantB.total,
      opened: variantB.successCount,
      bounced: variantB.failCount,
    },
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
          <Bar dataKey="opened" fill="#10b981" name="Opened" />
          <Bar dataKey="bounced" fill="#ef4444" name="Bounced" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

