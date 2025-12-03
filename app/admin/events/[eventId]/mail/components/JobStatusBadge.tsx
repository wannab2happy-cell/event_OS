import { Badge } from '@/components/ui/Badge';
import type { EmailJob } from '@/lib/mail/types';

interface JobStatusBadgeProps {
  status: EmailJob['status'];
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
const statusConfig = {
  pending: { label: '대기 중', variant: 'default' as const },
  processing: { label: '발송 중', variant: 'info' as const },
  completed: { label: '완료', variant: 'success' as const },
  failed: { label: '실패', variant: 'error' as const },
  failed_manual: { label: '수동 중단', variant: 'error' as const },
  stopped: { label: '중단됨', variant: 'warning' as const },
};

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

