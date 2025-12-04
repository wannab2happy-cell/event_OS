'use client';

import Link from 'next/link';
import { Clock, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import type { EmailJob } from '@/lib/mail/types';

interface JobRowProps {
  job: EmailJob;
  templateName?: string;
  eventId: string;
}

export function JobRow({ job, templateName, eventId }: JobRowProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
        return 'text-gray-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgress = () => {
    if (job.total_count === 0) return 0;
    const completed = job.success_count + job.fail_count;
    return Math.round((completed / job.total_count) * 100);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Link href={`/admin/events/${eventId}/mail/jobs/${job.id}`}>
      <div className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {templateName || `Job #${job.id.slice(0, 8)}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(job.created_at)}</p>
            </div>
          </div>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {job.status === 'pending' ? '대기 중' : job.status === 'processing' ? '발송 중' : job.status === 'completed' ? '완료' : '실패'}
          </span>
        </div>

        {job.status === 'processing' && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{getProgress()}% 완료</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>전체: {job.total_count}</span>
          <span className="text-green-600">성공: {job.success_count}</span>
          {job.fail_count > 0 && <span className="text-red-600">실패: {job.fail_count}</span>}
          {job.status === 'processing' && (
            <span className="text-blue-600">
              대기: {job.total_count - job.success_count - job.fail_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}




