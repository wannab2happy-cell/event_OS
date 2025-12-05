/**
 * Get Dashboard Stats
 * 
 * Server action to fetch dashboard statistics for staff
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface DashboardStats {
  total: number;
  checkedIn: number;
  notArrived: number;
  vipTotal: number;
  vipArrived: number;
  assignmentRate: number;
}

export async function getDashboardStats(eventId: string): Promise<DashboardStats> {
  try {
    // Get total participants
    const { count: total } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .in('status', ['registered', 'completed']);

    // Get checked in count
    const { count: checkedIn } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .eq('checked_in', true)
      .in('status', ['registered', 'completed']);

    // Get VIP total
    const { count: vipTotal } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .or('vip.eq.true,is_vip.eq.true')
      .in('status', ['registered', 'completed']);

    // Get VIP arrived
    const { count: vipArrived } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .eq('checked_in', true)
      .or('vip.eq.true,is_vip.eq.true')
      .in('status', ['registered', 'completed']);

    // Get assignment rate
    const { count: assignedCount } = await supabaseAdmin
      .from('table_assignments')
      .select('participant_id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_draft', false);

    const assignmentRate =
      total && total > 0 ? Math.round((assignedCount || 0) / total * 100) : 0;

    return {
      total: total || 0,
      checkedIn: checkedIn || 0,
      notArrived: (total || 0) - (checkedIn || 0),
      vipTotal: vipTotal || 0,
      vipArrived: vipArrived || 0,
      assignmentRate,
    };
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return {
      total: 0,
      checkedIn: 0,
      notArrived: 0,
      vipTotal: 0,
      vipArrived: 0,
      assignmentRate: 0,
    };
  }
}

