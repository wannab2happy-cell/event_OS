import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface ChangeLogsPanelProps {
  data: {
    id: string;
    changedAt: string;
    field: string;
    label?: string | null;
    beforeValue?: string | null;
    afterValue?: string | null;
    changedByEmail?: string | null;
    changedByName?: string | null;
    source?: string | null;
  }[];
}

export default function ChangeLogsPanel({ data }: ChangeLogsPanelProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getSourceLabel = (source: string | null | undefined) => {
    if (!source) return 'Unknown';
    if (source === 'admin') return 'Admin';
    if (source === 'self_portal') return 'Self Portal';
    if (source === 'import') return 'Import';
    return source;
  };

  if (data.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Change Logs</CardTitle>
          <CardDescription>변경 이력</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No change logs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">Change Logs</CardTitle>
        <CardDescription>변경 이력 ({data.length}건)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(log.changedAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {log.label || log.field}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span
                      title={log.beforeValue || undefined}
                      className="block max-w-xs truncate"
                    >
                      {truncateText(log.beforeValue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span
                      title={log.afterValue || undefined}
                      className="block max-w-xs truncate font-medium"
                    >
                      {truncateText(log.afterValue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.changedByName || log.changedByEmail || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getSourceLabel(log.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

