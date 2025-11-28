export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import { getParticipantInfoCenter } from '@/actions/participants/getParticipantInfoCenter';
import ParticipantInfoCenterClient from '@/components/admin/participants/ParticipantInfoCenterClient';

type ParticipantInfoPageProps = {
  params: Promise<{ eventId?: string; participantId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function ParticipantInfoPage({ params }: ParticipantInfoPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
  const participantId = resolvedParams?.participantId;

  if (!eventId || !participantId) {
    return notFound();
  }

  const [event, infoData] = await Promise.all([
    fetchEvent(eventId),
    getParticipantInfoCenter({ eventId, participantId }),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/events" className="hover:text-gray-700">
              Events
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/admin/events/${eventId}/participants`} className="hover:text-gray-700">
              {event.title}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/admin/events/${eventId}/participants`} className="hover:text-gray-700">
              Participants
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{infoData.basic.name}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Info</span>
          </nav>

          <h1 className="text-2xl font-semibold text-gray-900">Participant Info Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            {infoData.basic.name} ({infoData.basic.email}) - 상세 정보 조회
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/events/${eventId}/participants`}>
            <button className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to list
            </button>
          </Link>
          <Link href={`/admin/events/${eventId}/participants/${participantId}/edit`}>
            <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <ParticipantInfoCenterClient eventId={eventId} participantId={participantId} infoData={infoData} />
    </div>
  );
}

