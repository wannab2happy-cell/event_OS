/**
 * Upsert Vendor Note
 * 
 * Server action to create or update a vendor note
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, isEventAdmin } from '@/lib/auth/roles';
import type { VendorNote, VendorCategory, VendorPriority, VendorStatus } from '@/lib/vendors/vendorTypes';

export interface UpsertVendorNoteInput {
  id?: string;
  event_id: string;
  category: VendorCategory;
  title: string;
  content?: string | null;
  vendor_name?: string | null;
  owner?: string | null;
  priority?: VendorPriority;
  status?: VendorStatus;
  due_at?: string | null;
}

export async function upsertVendorNote(
  eventId: string,
  note: UpsertVendorNoteInput
): Promise<VendorNote> {
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

    // Ensure event_id matches
    if (note.event_id !== eventId) {
      throw new Error('Event ID mismatch');
    }

    const now = new Date().toISOString();
    const noteData = {
      ...note,
      updated_at: now,
    };

    if (note.id) {
      // Update existing note
      const { data, error } = await supabaseAdmin
        .from('event_vendor_notes')
        .update(noteData)
        .eq('id', note.id)
        .eq('event_id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Error updating vendor note:', error);
        throw new Error('Failed to update vendor note');
      }

      return data as VendorNote;
    } else {
      // Insert new note
      const { data, error } = await supabaseAdmin
        .from('event_vendor_notes')
        .insert({
          ...noteData,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vendor note:', error);
        throw new Error('Failed to create vendor note');
      }

      return data as VendorNote;
    }
  } catch (err) {
    console.error('Error in upsertVendorNote:', err);
    throw err;
  }
}

