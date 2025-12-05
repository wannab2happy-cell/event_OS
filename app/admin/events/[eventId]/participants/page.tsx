/**
 * Participants Page
 * 
 * Phase 3: Refined Participants module
 * 
 * Provides powerful but clear filters/search/sort via Action Bar,
 * shows operationally useful data in both Table and Card views,
 * and uses a structured, multi-section Drawer for each participant.
 */

import { notFound } from 'next/navigation';
import { CheckCircle2, Clock4 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant, ParticipantStatus } from '@/lib/types/participants';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { MetricCard } from '@/components/ui/metric-card';
import { ParticipantsClient } from './components/ParticipantsClient';

const statusMap: Record<
  ParticipantStatus,
  { label: string; icon: typeof Clock4 }
> = {
  invited: {
    label: '초대됨',
    icon: Clock4,
  },
  registered: {
    label: '등록 중',
    icon: Clock4,
  },
  cancelled: {
    label: '취소됨',
    icon: Clock4,
  },
  completed: {
    label: '등록 완료',
    icon: CheckCircle2,
  },
};

type ParticipantListPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function ParticipantListPage({ params }: ParticipantListPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const { data: participants, error } = await supabaseAdmin
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Admin participant fetch error:', error);
    return (
      <div className="p-8 text-red-500">데이터 로드 오류: 관리자 권한 및 RLS 설정을 확인하세요.</div>
    );
  }

  if (!participants) {
    return notFound();
  }

  const participantList = participants as Participant[];

  const countByStatus = participantList.reduce(
    (acc, participant) => {
      acc[participant.status] = (acc[participant.status] ?? 0) + 1;
      return acc;
    },
    {
      invited: 0,
      registered: 0,
      cancelled: 0,
      completed: 0,
    } as Record<ParticipantStatus, number>
  );

  return (
    <AdminPage title="Participants" subtitle="전체 참가자 관리">
      {/* Status Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {(Object.keys(statusMap) as ParticipantStatus[]).map((status) => {
          const statusInfo = statusMap[status];
          const count = countByStatus[status] ?? 0;
          return (
            <MetricCard
              key={status}
              title={statusInfo.label}
              value={count}
              icon={statusInfo.icon}
            />
          );
        })}
      </div>

      {/* Participants List with Filters */}
      <ParticipantsClient initialParticipants={participantList} eventId={eventId} />
    </AdminPage>
  );
}

