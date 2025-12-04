'use client';

import { Mail, CheckCircle, XCircle, Briefcase, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface StatCardsProps {
  stats: {
    totalJobs: number;
    totalEmailsSent: number;
    totalSuccess: number;
    totalFailed: number;
    last24hStats: {
      success: number;
      failed: number;
    };
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const successRate = stats.totalEmailsSent > 0 
    ? ((stats.totalSuccess / stats.totalEmailsSent) * 100).toFixed(1)
    : '0';

  const last24hTotal = stats.last24hStats.success + stats.last24hStats.failed;
  const last24hRate = last24hTotal > 0
    ? ((stats.last24hStats.success / last24hTotal) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Emails Sent */}
      <Card className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmailsSent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Success */}
      <Card className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Success</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalSuccess.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{successRate}% success rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Failed */}
      <Card className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalFailed.toLocaleString()}</p>
              {stats.totalEmailsSent > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.totalFailed / stats.totalEmailsSent) * 100).toFixed(1)}% failure rate
                </p>
              )}
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Count & 24h Trend */}
      <Card className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              {last24hTotal > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Last 24h: {stats.last24hStats.success} sent ({last24hRate}% success)
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




