'use client';

import { Badge } from '@/components/ui/Badge';
import type { ABTestStatus } from '@/lib/mail/types';

interface ABTestStatusBadgeProps {
  status: ABTestStatus;
}

export function ABTestStatusBadge({ status }: ABTestStatusBadgeProps) {
  const statusConfig = {
    draft: { label: 'DRAFT', variant: 'default' as const },
    running: { label: 'RUNNING', variant: 'info' as const },
    completed: { label: 'COMPLETED', variant: 'success' as const },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

