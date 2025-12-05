/**
 * Get Vendor Notes
 * 
 * Server action to fetch vendor notes
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, isEventAdmin } from '@/lib/auth/roles';
import type { VendorNote, VendorCategory } from '@/lib/vendors/vendorTypes';

export async function getVendorNotes(
  eventId: string,
  category?: VendorCategory
): Promise<VendorNote[]> {
  try {
    // Verify user is event admin
    const userWithRole = await getCurrentUserWithRole();
    if (!userWithRole) {
      throw new Error('Not authenticated');
    }

    const isAdmin = await isEventAdmin(eventId, userWithRole.id);
    if (!isAdmin) {
      throw new Error('Access denied. Event admin required.');
    }

    // Build query
    let query = supabaseAdmin
      .from('event_vendor_notes')
      .select('*')
      .eq('event_id', eventId);

    if (category) {
      query = query.eq('category', category);
    }

    // Order by due_at NULLS LAST, then created_at DESC
    const { data, error } = await query
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting vendor notes:', error);
      throw new Error('Failed to fetch vendor notes');
    }

    return (data || []) as VendorNote[];
  } catch (err) {
    console.error('Error in getVendorNotes:', err);
    throw err;
  }
}

