'use client';

import Link from 'next/link';
import { Clock, Play, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import type { MessageJob } from '@/lib/mail/types';

interface MessageJobRowProps {
  job: MessageJob;
  templateName?: string;
  eventId: string;
}

export function MessageJobRow({ job, templateName, eventId }: MessageJobRowProps) {
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

  const getStatusLabel = () => {
    switch (job.status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '발송 중';
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      default:
        return '알 수 없음';
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

  const getChannelLabel = () => {
    return job.channel === 'sms' ? 'SMS' : 'Kakao';
  };

  const getChannelColor = () => {
    return job.channel === 'sms' ? 'bg-yellow-100 text-yellow-700' : 'bg-black text-yellow-300';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const progress = job.total_count > 0 ? Math.round((job.processed_count / job.total_count) * 100) : 0;

  return (
    <Link href={`/admin/events/${eventId}/messages/jobs/${job.id}`}>
      <div className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {templateName || `Job #${job.id.slice(0, 8)}`}
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getChannelColor()}`}>
                  {getChannelLabel()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(job.created_at)}</p>
            </div>
          </div>
          <span className={`text-xs font-medium ${getStatusColor()}`}>{getStatusLabel()}</span>
        </div>

        {(job.status === 'processing' || job.status === 'pending') && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% 완료</p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>전체: {job.total_count}</span>
          <span className="text-green-600">성공: {job.success_count}</span>
          {job.fail_count > 0 && <span className="text-red-600">실패: {job.fail_count}</span>}
        </div>
      </div>
    </Link>
  );
}




