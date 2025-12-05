'use client';

import { CheckCircle2, Clock4 } from 'lucide-react';
import type { ParticipantStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ParticipantStatus;
}

const statusMap: Record<
  ParticipantStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  invited: {
    label: '초대됨',
    color: 'bg-gray-100 text-gray-700',
    icon: <Clock4 className="w-3 h-3" />,
  },
  registered: {
    label: '등록 중',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Clock4 className="w-3 h-3" />,
  },
  cancelled: {
    label: '취소됨',
    color: 'bg-red-100 text-red-700',
    icon: <Clock4 className="w-3 h-3" />,
  },
  completed: {
    label: '등록 완료',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusInfo = statusMap[status] ?? statusMap.invited;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusInfo.color}`}
    >
      {statusInfo.icon}
      {statusInfo.label}
    </span>
  );
}




