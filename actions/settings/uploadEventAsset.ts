/**
 * Upload Event Asset
 * 
 * Server action to upload images/assets for events
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function uploadEventAsset(
  eventId: string,
  file: File,
  type: 'logo' | 'hero'
): Promise<{ url: string } | { error: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}/${type}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('event_assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading asset:', error);
      return { error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('event_assets').getPublicUrl(fileName);

    return { url: publicUrl };
  } catch (err) {
    console.error('Error in uploadEventAsset:', err);
    return { error: err instanceof Error ? err.message : 'Failed to upload asset' };
  }
}

