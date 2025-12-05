/**
 * Get Check-in Trend
 * 
 * Server action to fetch check-in trend data
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface CheckInTrendPoint {
  interval: string; // "HH:mm"
  count: number;
}

export async function getCheckInTrend(eventId: string): Promise<CheckInTrendPoint[]> {
  try {
    // Get check-ins from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: checkIns, error } = await supabaseAdmin
      .from('event_participants')
      .select('checked_in_at')
      .eq('event_id', eventId)
      .eq('checked_in', true)
      .gte('checked_in_at', todayISO)
      .order('checked_in_at', { ascending: true });

    if (error) {
      console.error('Error getting check-in trend:', error);
      return [];
    }

    // Group by hour
    const hourlyMap = new Map<string, number>();

    checkIns?.forEach((checkIn) => {
      if (checkIn.checked_in_at) {
        const date = new Date(checkIn.checked_in_at);
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(Math.floor(date.getMinutes() / 15) * 15).padStart(2, '0');
        const interval = `${hour}:${minute}`;

        hourlyMap.set(interval, (hourlyMap.get(interval) || 0) + 1);
      }
    });

    // Convert to array and sort
    const trend: CheckInTrendPoint[] = Array.from(hourlyMap.entries())
      .map(([interval, count]) => ({ interval, count }))
      .sort((a, b) => a.interval.localeCompare(b.interval));

    // Fill in missing intervals for the last 8 hours
    const now = new Date();
    const intervals: CheckInTrendPoint[] = [];
    for (let i = 7; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = String(time.getHours()).padStart(2, '0');
      const minute = String(Math.floor(time.getMinutes() / 15) * 15).padStart(2, '0');
      const interval = `${hour}:${minute}`;

      const existing = trend.find((t) => t.interval === interval);
      intervals.push({
        interval,
        count: existing?.count || 0,
      });
    }

    return intervals;
  } catch (err) {
    console.error('Error in getCheckInTrend:', err);
    return [];
  }
}

