'use client';

import { Badge } from '@/components/ui/Badge';

interface AutomationStatusBadgeProps {
  isActive: boolean;
}

export function AutomationStatusBadge({ isActive }: AutomationStatusBadgeProps) {
  return (
    <Badge variant={isActive ? 'success' : 'default'}>
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </Badge>
  );
}




