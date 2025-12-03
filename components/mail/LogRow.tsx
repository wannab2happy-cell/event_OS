'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { EmailLog } from '@/lib/mail/types';

interface LogRowProps {
  log: EmailLog;
}

export function LogRow({ log }: LogRowProps) {
  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-center gap-4 py-2 px-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <div className="w-32 text-xs text-gray-500 flex-shrink-0">{formatTimestamp(log.sent_at)}</div>
      <div className="flex-1 min-w-0 text-sm text-gray-900 truncate">{log.email}</div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {log.status === 'success' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            성공
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            실패
          </span>
        )}
      </div>
    </div>
  );
}

