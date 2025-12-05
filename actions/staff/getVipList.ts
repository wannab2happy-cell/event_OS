/**
 * Get VIP List
 * 
 * Server action to fetch VIP participants
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface VipParticipant {
  id: string;
  name: string;
  company: string | null;
  checked_in: boolean;
  table_name: string | null;
  seat_number: number | null;
}

export async function getVipList(eventId: string): Promise<VipParticipant[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, company, checked_in, table_name, seat_number')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .or('vip.eq.true,is_vip.eq.true')
      .in('status', ['registered', 'completed'])
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting VIP list:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      checked_in: p.checked_in,
      table_name: p.table_name,
      seat_number: p.seat_number,
    }));
  } catch (err) {
    console.error('Error in getVipList:', err);
    return [];
  }
}

