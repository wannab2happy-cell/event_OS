'use client';

import { Badge } from '@/components/ui/Badge';

interface FollowUpStatusBadgeProps {
  isActive: boolean;
}

export function FollowUpStatusBadge({ isActive }: FollowUpStatusBadgeProps) {
  return (
    <Badge variant={isActive ? 'success' : 'default'}>
      {isActive ? 'ACTIVE' : 'INACTIVE'}
    </Badge>
  );
}

