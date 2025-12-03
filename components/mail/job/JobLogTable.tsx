'use client';

import { useState, useTransition } from 'react';
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { EmailLog } from '@/lib/mail/types';
import type { JobLogFilter } from '@/lib/mail/types';
import type { PaginatedResponse } from '@/lib/mail/types';
import { cn } from '@/lib/utils';

interface JobLogTableProps {
  jobId: string;
  initialLogs: EmailLog[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
}

export function JobLogTable({
  jobId,
  initialLogs,
  initialTotal,
  initialPage,
  initialPageSize,
}: JobLogTableProps) {
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [filter, setFilter] = useState<JobLogFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, startLoading] = useTransition();

  const loadLogs = async (newPage: number, newFilter: JobLogFilter, newSearch: string) => {
    startLoading(async () => {
      try {
        const params = new URLSearchParams({
          jobId,
          filter: newFilter,
          page: newPage.toString(),
          pageSize: initialPageSize.toString(),
          ...(newSearch && { search: newSearch }),
        });

        const response = await fetch(`/api/mail/job-logs?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }

        const result: PaginatedResponse<EmailLog> = await response.json();

        if (!result.error) {
          setLogs(result.data);
          setTotal(result.total);
          setPage(newPage);
        }
      } catch (err) {
        console.error('Error loading logs:', err);
      }
    });
  };

  const handleFilterChange = (newFilter: JobLogFilter) => {
    setFilter(newFilter);
    loadLogs(0, newFilter, searchQuery);
  };

  const handleSearch = () => {
    loadLogs(0, filter, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    loadLogs(newPage, filter, searchQuery);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalPages = Math.ceil(total / initialPageSize);

  return (
    <Card className="rounded-lg border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-1">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('all')}
              className="text-sm"
              disabled={isLoading}
            >
              All ({total})
            </Button>
            <Button
              variant={filter === 'success' ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('success')}
              className="text-sm"
              disabled={isLoading}
            >
              Success
            </Button>
            <Button
              variant={filter === 'failed' ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('failed')}
              className="text-sm"
              disabled={isLoading}
            >
              Failed
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSearch} variant="secondary" disabled={isLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      로그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{log.email}</td>
                      <td className="px-4 py-3">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Success</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {log.error_message ? (
                          <div className="max-w-[240px]">
                            <p className="text-sm text-red-600 truncate" title={log.error_message}>
                              {log.error_message}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page + 1} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0 || isLoading}
                variant="secondary"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1 || isLoading}
                variant="secondary"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

