import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, X } from 'lucide-react';

interface CheckInHistoryPanelProps {
  data: {
    id: string;
    checkedAt: string;
    location?: string | null;
    type?: string | null;
    method?: string | null;
    staffEmail?: string | null;
    staffName?: string | null;
    source?: string | null;
    isDuplicate?: boolean | null;
    note?: string | null;
  }[];
}

export default function CheckInHistoryPanel({ data }: CheckInHistoryPanelProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodLabel = (method: string | null | undefined) => {
    if (!method) return 'Unknown';
    if (method === 'admin_scanner') return 'Admin Scanner';
    if (method === 'kiosk') return 'KIOSK';
    if (method === 'manual') return 'Manual';
    return method;
  };

  if (data.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Check-in History</CardTitle>
          <CardDescription>체크인 이력</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No check-in history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Check-in History</CardTitle>
        <CardDescription>체크인 이력 ({data.length}건)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(log.checkedAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.location || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getMethodLabel(log.method)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.staffName || log.staffEmail || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {log.isDuplicate ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <X className="h-3 w-3 mr-1" />
                        Duplicate
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

