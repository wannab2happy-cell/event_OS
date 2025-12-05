/**
 * Result Badge Component
 * 
 * Small badge for check-in status
 */

import { Badge } from '@/components/ui/Badge';

interface ResultBadgeProps {
  status: 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export default function ResultBadge({ status, children }: ResultBadgeProps) {
  const variantMap = {
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'error' as const,
  };

  return <Badge variant={variantMap[status]}>{children}</Badge>;
}

