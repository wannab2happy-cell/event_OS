'use client';

import { useEffect, useState } from 'react';
import { getJobs } from '@/actions/mail/getJobs';
import type { EmailJob } from '@/lib/mail/types';
import { useToast } from '@/components/ui/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function JobList({
  eventId,
  onSelectJob,
}: {
  eventId: string;
  onSelectJob: (jobId: string) => void;
}) {
  const { error } = useToast();
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [eventId]);

  async function load() {
    try {
      setLoading(true);
      const data = await getJobs(eventId);
      setJobs(data);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      error('발송 작업 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'running':
        return '진행 중';
      case 'pending':
        return '대기 중';
      default:
        return status;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">발송 작업</h2>
        <button
          onClick={load}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          새로고침
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">발송 작업이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onSelectJob(job.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    {new Date(job.created_at).toLocaleString('ko-KR')}
                  </div>
                  <div className="font-medium text-gray-900">작업 ID: {job.id.slice(0, 8)}...</div>
                  <div className="text-sm text-gray-600 mt-1">
                    발송: {job.sent_count} / {job.recipient_count} | 실패: {job.failed_count}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}
                >
                  {getStatusText(job.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

