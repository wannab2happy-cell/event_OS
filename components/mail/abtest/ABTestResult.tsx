'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ABTestResult } from '@/lib/mail/types';

interface ABTestResultProps {
  results: ABTestResult[];
}

export function ABTestResult({ results }: ABTestResultProps) {
  if (results.length === 0) {
    return (
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">No results available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Find winner
  const winner = results.reduce((best, current) =>
    current.successRate > best.successRate ? current : best
  );

  const chartData = results.map((r) => ({
    variant: r.variantLabel,
    successRate: r.successRate,
    failRate: r.failRate,
    total: r.total,
  }));

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variant" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
              <Bar dataKey="failRate" fill="#ef4444" name="Failure Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-700">Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result) => {
              const isWinner = result.variantLabel === winner.variantLabel;
              return (
                <div
                  key={result.variantIndex}
                  className={`p-4 border rounded-lg ${isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">Variant {result.variantLabel}</span>
                      {isWinner && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Winner
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{result.templateName || 'Unknown Template'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-2 font-medium">{result.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success:</span>
                      <span className="ml-2 font-medium text-green-600">{result.successCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{result.failCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 font-bold">{result.successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {results.length > 1 && winner.successRate > 0 && (
        <Card className="rounded-xl border border-green-200 bg-green-50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-900">
              <strong>Recommendation:</strong> Variant {winner.variantLabel} performs{' '}
              {results
                .filter((r) => r.variantLabel !== winner.variantLabel)
                .map((r) => {
                  const diff = winner.successRate - r.successRate;
                  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
                })
                .join(' and ')}{' '}
              better than other variants. Consider promoting Variant {winner.variantLabel} as the main template.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




