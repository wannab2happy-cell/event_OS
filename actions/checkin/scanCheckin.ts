'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface ScanCheckinInput {
  eventId: string;
  qr: string;
  scannedBy?: string;
}

interface ScanCheckinResult {
  participant: {
    id: string;
    name: string;
    email: string;
    vipLevel: number;
  };
  alreadyChecked: boolean;
}

/**
 * QR payload에서 participantId 추출
 */
async function resolveParticipantIdFromQr({
  eventId,
  qr,
  supabase,
}: {
  eventId: string;
  qr: string;
  supabase: ReturnType<typeof supabaseAdmin>;
}): Promise<string | null> {
  try {
    // 1) JSON 형태의 QR payload 파싱 시도
    try {
      const payload = JSON.parse(qr);
      if (payload.p_id && typeof payload.p_id === 'string') {
        // participantId 직접 확인
        const { data: participant } = await supabase
          .from('event_participants')
          .select('id')
          .eq('id', payload.p_id)
          .eq('event_id', eventId)
          .single();

        if (participant) {
          return payload.p_id;
        }
      }
    } catch {
      // JSON 파싱 실패 시 무시하고 다음 방법 시도
    }

    // 2) qr이 직접 participant_id인 경우
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('id', qr)
      .eq('event_id', eventId)
      .single();

    if (participant) {
      return qr;
    }

    // 3) 이메일로 검색 (참가자 이메일이 QR에 포함된 경우)
    const { data: participantByEmail } = await supabase
      .from('event_participants')
      .select('id')
      .eq('email', qr)
      .eq('event_id', eventId)
      .single();

    if (participantByEmail) {
      return participantByEmail.id;
    }

    return null;
  } catch (error) {
    console.error('resolveParticipantIdFromQr error:', error);
    return null;
  }
}

/**
 * 체크인 스캔 Server Action
 */
export async function scanCheckinAction(input: unknown): Promise<ScanCheckinResult> {
  try {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input');
    }

    const { eventId, qr, scannedBy } = input as ScanCheckinInput;

    if (!eventId || typeof eventId !== 'string') {
      throw new Error('eventId is required');
    }

    if (!qr || typeof qr !== 'string' || qr.trim().length === 0) {
      throw new Error('QR 값이 필요합니다.');
    }

    const supabase = supabaseAdmin();

    // 1) QR payload → participantId 추출
    const participantId = await resolveParticipantIdFromQr({
      eventId,
      qr: qr.trim(),
      supabase,
    });

    if (!participantId) {
      throw new Error('QR 정보를 해석할 수 없습니다. 유효한 QR 코드를 스캔해주세요.');
    }

    // 2) 참가자 정보 로드
    const { data: participant, error: pError } = await supabase
      .from('event_participants')
      .select('id, name, email, is_checked_in, vip_level, status')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (pError || !participant) {
      throw new Error('참가자를 찾을 수 없습니다.');
    }

    const alreadyChecked = participant.is_checked_in === true;

    // 3) 체크인 상태 업데이트 (이미 체크인이어도, 로그는 남긴다)
    if (!alreadyChecked) {
      const { error: updateError } = await supabase
        .from('event_participants')
        .update({
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
          status: participant.status === 'completed' ? 'checked_in' : participant.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participant.id)
        .eq('event_id', eventId);

      if (updateError) {
        throw new Error(`체크인 상태 업데이트에 실패했습니다: ${updateError.message}`);
      }
    }

    // 4) 체크인 로그 기록
    const { error: logError } = await supabase.from('checkin_logs').insert({
      event_id: eventId,
      participant_id: participant.id,
      scanned_by: scannedBy || 'admin',
      source: 'admin_scanner',
      is_duplicate: alreadyChecked,
      note: alreadyChecked ? '중복 체크인 시도' : null,
    });

    if (logError) {
      console.error('checkin_logs insert error', logError);
      // 로그 저장 실패해도 체크인은 성공한 것으로 처리
    }

    // 페이지 재검증
    revalidatePath(`/admin/events/${eventId}/scanner`);

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        vipLevel: (participant.vip_level as number) || 0,
      },
      alreadyChecked,
    };
  } catch (error: any) {
    console.error('scanCheckinAction error:', error);
    throw error;
  }
}

