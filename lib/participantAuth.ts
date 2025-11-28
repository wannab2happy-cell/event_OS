import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Participant } from '@/lib/types';

/**
 * 현재 참가자 정보 가져오기 (이벤트별)
 */
export async function getCurrentParticipantForEvent(eventId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    return { participant: null, supabase, user: null };
  }

  const { data: participant } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('email', session.user.email)
    .maybeSingle();

  return { participant: participant as Participant | null, supabase, user: session.user };
}

/**
 * 참가자 인증 체크 (미인증 시 로그인 페이지로 리다이렉트)
 */
export async function assertParticipantAuth(eventId: string) {
  const { participant, supabase, user } = await getCurrentParticipantForEvent(eventId);

  if (!user?.email || !participant) {
    redirect(`/${eventId}/login?redirect=/${eventId}/me`);
  }

  return { participant, supabase, user };
}

