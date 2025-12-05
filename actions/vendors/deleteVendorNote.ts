/**
 * Delete Vendor Note
 * 
 * Server action to delete a vendor note
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, isEventAdmin } from '@/lib/auth/roles';

export async function deleteVendorNote(eventId: string, noteId: string): Promise<void> {
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

    // Delete note
    const { error } = await supabaseAdmin
      .from('event_vendor_notes')
      .delete()
      .eq('id', noteId)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error deleting vendor note:', error);
      throw new Error('Failed to delete vendor note');
    }
  } catch (err) {
    console.error('Error in deleteVendorNote:', err);
    throw err;
  }
}

