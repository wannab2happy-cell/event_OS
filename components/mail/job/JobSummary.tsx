'use client';

import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { EmailJob } from '@/lib/mail/types';
import { cn } from '@/lib/utils';

interface JobSummaryProps {
  job: EmailJob & { template_name?: string };
}

const statusConfig = {
  pending: { label: '대기 중', color: 'bg-gray-100 text-gray-800', icon: Clock },
  processing: { label: '처리 중', color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { label: '완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { label: '실패', color: 'bg-red-100 text-red-800', icon: XCircle },
  failed_manual: { label: '수동 중단', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  stopped: { label: '중단됨', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
};

export function JobSummary({ job }: JobSummaryProps) {
  const StatusIcon = statusConfig[job.status]?.icon || Clock;
  const statusLabel = statusConfig[job.status]?.label || job.status;
  const statusColor = statusConfig[job.status]?.color || 'bg-gray-100 text-gray-800';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="rounded-lg border border-gray-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            {job.template_name || 'Email Campaign'}
          </CardTitle>
          <div className={cn('flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', statusColor)}>
            <StatusIcon className="w-4 h-4" />
            {statusLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">생성 시간</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(job.created_at)}</p>
          </div>
          {job.status === 'completed' || job.status === 'failed' || job.status === 'stopped' ? (
            <div>
              <p className="text-sm text-gray-500">완료 시간</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(job.updated_at)}</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}




