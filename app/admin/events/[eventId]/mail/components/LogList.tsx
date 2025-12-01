'use client';

import { useEffect, useState } from 'react';
import { getEmailLogs } from '@/actions/mail/getEmailLogs';
import type { EmailLog } from '@/lib/mail/types';
import { useToast } from '@/components/ui/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LogList({ jobId }: { jobId: string }) {
  const { error } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      load();
    }
  }, [jobId]);

  async function load() {
    try {
      setLoading(true);
      const data = await getEmailLogs(jobId);
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load logs:', err);
      error('발송 로그를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">이메일 발송 로그</h2>
        <button
          onClick={load}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          새로고침
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">로그가 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`border p-4 rounded-lg ${
                log.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{log.email}</div>
                  {log.sent_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      발송 시간: {new Date(log.sent_at).toLocaleString('ko-KR')}
                    </div>
                  )}
                  {log.error_message && (
                    <div className="text-sm text-red-600 mt-2 font-medium">
                      오류: {log.error_message}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success'
                      ? 'text-green-700 bg-green-100'
                      : 'text-red-700 bg-red-100'
                  }`}
                >
                  {log.status === 'success' ? '성공' : '실패'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

