'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface GetOperationLogsInput {
  eventId: string;
  limit?: number;
}

/**
 * 운영 로그 조회 Server Action
 */
export async function getOperationLogs(input: GetOperationLogsInput) {
  try {
    const { eventId, limit = 100 } = input;

    const { data: logs, error } = await supabaseAdmin
      .from('operation_logs')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Operation logs fetch error:', error);
      return [];
    }

    return logs || [];
  } catch (error) {
    console.error('getOperationLogs error:', error);
    return [];
  }
}

