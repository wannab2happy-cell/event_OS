'use client';

import { LogRow } from './LogRow';
import type { EmailLog } from '@/lib/mail/types';

interface LogListProps {
  logs: EmailLog[];
}

export function LogList({ logs }: LogListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-600">Recent Logs</h3>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">로그가 없습니다.</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




