'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';
import type { EmailJob } from '@/lib/mail/types';

interface JobProgressProps {
  job: EmailJob;
}

export function JobProgress({ job }: JobProgressProps) {
  const progress = job.total_count > 0 ? (job.processed_count / job.total_count) * 100 : 0;
  const successRate =
    job.processed_count > 0 ? ((job.success_count / job.processed_count) * 100).toFixed(1) : '0';

  return (
    <Card className="rounded-lg border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {job.processed_count} / {job.total_count} processed
            </span>
            <span className="text-sm font-semibold text-blue-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Success</p>
              <p className="text-lg font-semibold text-green-600">{job.success_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-red-600">{job.fail_count}</p>
            </div>
          </div>
          {job.processed_count > 0 && (
            <div className="ml-auto">
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-lg font-semibold text-gray-900">{successRate}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




