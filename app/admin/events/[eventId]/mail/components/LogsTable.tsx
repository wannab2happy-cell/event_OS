'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import type { EmailLog } from '@/lib/mail/types';

interface LogsTableProps {
  logs: EmailLog[];
}

export function LogsTable({ logs }: LogsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">로그가 없습니다.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error Message</TableHead>
          <TableHead>Sent At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.email}</TableCell>
            <TableCell>
              <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                {log.status === 'success' ? 'Success' : 'Failed'}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-600 max-w-md">
              {log.error_message ? (
                <span className="text-rose-600">{log.error_message}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-gray-500">{formatDate(log.sent_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

