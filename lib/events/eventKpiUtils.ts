/**
 * Event KPI Utilities
 * 
 * Helper functions for computing event KPIs
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface EventKPIs {
  registrationsCount: number;
  checkedInCount: number;
  mailOpenRate: number;
  tableAssignmentRate: number;
}

/**
 * Get event KPIs
 */
export async function getEventKpis(eventId: string): Promise<EventKPIs> {
  try {
    // Get registrations count
    const { count: registrationsCount } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .in('status', ['registered', 'completed']);

    // Get checked-in count
    const { count: checkedInCount } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true)
      .eq('checked_in', true);

    // Get mail open rate (simplified - using success_count as delivered)
    const { data: jobs } = await supabaseAdmin
      .from('email_jobs')
      .select('id, success_count')
      .eq('event_id', eventId)
      .eq('status', 'completed');

    const totalSent = jobs?.reduce((sum, job) => sum + (job.success_count || 0), 0) || 0;
    
    // For now, use a simplified calculation
    // TODO: When email_opened is available in email_logs, use actual open rate
    const mailOpenRate = totalSent > 0 ? Math.round((totalSent * 0.3)) : 0; // Placeholder: 30% estimate

    // Get table assignment rate
    const { count: totalParticipants } = await supabaseAdmin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true);

    const { count: assignedCount } = await supabaseAdmin
      .from('table_assignments')
      .select('participant_id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_draft', false);

    const tableAssignmentRate =
      totalParticipants && totalParticipants > 0
        ? Math.round((assignedCount || 0) / totalParticipants * 100)
        : 0;

    return {
      registrationsCount: registrationsCount || 0,
      checkedInCount: checkedInCount || 0,
      mailOpenRate,
      tableAssignmentRate,
    };
  } catch (err) {
    console.error('Error computing event KPIs:', err);
    return {
      registrationsCount: 0,
      checkedInCount: 0,
      mailOpenRate: 0,
      tableAssignmentRate: 0,
    };
  }
}

