/**
 * Get Recent Check-ins
 * 
 * Server action to fetch recent check-ins
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface RecentCheckIn {
  id: string;
  name: string;
  company: string | null;
  vip: boolean;
  table_name: string | null;
  seat_number: number | null;
  checked_in_at: string;
}

export async function getRecentCheckIns(eventId: string, limit: number = 10): Promise<RecentCheckIn[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_participants')
      .select(
        `
        id,
        name,
        company,
        vip,
        is_vip,
        table_name,
        seat_number,
        checked_in_at
      `
      )
      .eq('event_id', eventId)
      .eq('checked_in', true)
      .not('checked_in_at', 'is', null)
      .order('checked_in_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting recent check-ins:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      vip: p.vip || p.is_vip || false,
      table_name: p.table_name,
      seat_number: p.seat_number,
      checked_in_at: p.checked_in_at || '',
    }));
  } catch (err) {
    console.error('Error in getRecentCheckIns:', err);
    return [];
  }
}

