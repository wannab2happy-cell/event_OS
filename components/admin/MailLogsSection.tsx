import { Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface MailLog {
  id: string;
  template_key: string;
  subject: string;
  target_filter: string;
  recipient_count: number;
  status: string;
  error_message?: string | null;
  sent_at: string;
  created_at: string;
}

interface MailLogsSectionProps {
  logs: MailLog[];
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    success: { label: '성공', className: 'bg-green-50 text-green-700' },
    partial: { label: '부분 성공', className: 'bg-amber-50 text-amber-700' },
    failed: { label: '실패', className: 'bg-red-50 text-red-700' },
    pending: { label: '대기 중', className: 'bg-gray-50 text-gray-700' },
  };

  const statusInfo = statusMap[status] || statusMap.pending;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}

function formatTemplateKey(key: string): string {
  const keyMap: Record<string, string> = {
    invite: '초대 메일',
    reminder_1: '리마인더 1차',
    reminder_2: '리마인더 2차',
    qr_pass: 'QR Pass 안내',
    confirmation: '확정 메일',
  };
  return keyMap[key] || key;
}

function formatTargetFilter(filter: string): string {
  const filterMap: Record<string, string> = {
    all: '전체 참가자',
    completed: '등록 완료',
    incomplete: '등록 미완료',
  };
  return filterMap[filter] || filter;
}

function formatDateTime(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export default function MailLogsSection({ logs }: MailLogsSectionProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500">아직 발송된 메일 로그가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">최근 발송 로그</CardTitle>
        <CardDescription>메일 발송 이력을 확인할 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">
                    [{formatTemplateKey(log.template_key)}]
                  </span>
                  <span className="text-sm text-gray-700">{log.subject}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span>대상: {formatTargetFilter(log.target_filter)}</span>
                  <span>•</span>
                  <span>수신자: {log.recipient_count}명</span>
                  {log.error_message && (
                    <>
                      <span>•</span>
                      <span className="text-red-600">오류: {log.error_message.substring(0, 50)}...</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                {getStatusBadge(log.status)}
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(log.sent_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

