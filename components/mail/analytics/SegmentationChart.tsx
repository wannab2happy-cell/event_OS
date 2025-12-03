'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { SegmentationBreakdown } from '@/lib/mail/types';

interface SegmentationChartProps {
  breakdown: SegmentationBreakdown;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function SegmentationChart({ breakdown }: SegmentationChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Company Breakdown */}
      {breakdown.company && breakdown.company.length > 0 && (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Company Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breakdown.company}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="company" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '12px' }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success_count" fill="#10b981" name="Success" />
                <Bar dataKey="failed_count" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* VIP Breakdown */}
      {breakdown.vip && (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">VIP vs Non-VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'VIP Success', value: breakdown.vip.vip.success_count },
                    { name: 'VIP Failed', value: breakdown.vip.vip.failed_count },
                    { name: 'Non-VIP Success', value: breakdown.vip.nonVip.success_count },
                    { name: 'Non-VIP Failed', value: breakdown.vip.nonVip.failed_count },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'VIP Success', value: breakdown.vip.vip.success_count },
                    { name: 'VIP Failed', value: breakdown.vip.vip.failed_count },
                    { name: 'Non-VIP Success', value: breakdown.vip.nonVip.success_count },
                    { name: 'Non-VIP Failed', value: breakdown.vip.nonVip.failed_count },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>VIP: {breakdown.vip.vip.total} total ({breakdown.vip.vip.success_count} success, {breakdown.vip.vip.failed_count} failed)</p>
              <p>Non-VIP: {breakdown.vip.nonVip.total} total ({breakdown.vip.nonVip.success_count} success, {breakdown.vip.nonVip.failed_count} failed)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Breakdown */}
      {breakdown.language && breakdown.language.length > 0 && (
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-700">Language Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breakdown.language}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success_count" fill="#10b981" name="Success" />
                <Bar dataKey="failed_count" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

