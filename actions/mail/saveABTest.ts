'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ABTestVariant } from '@/lib/mail/types';

interface SaveABTestInput {
  id?: string;
  eventId: string;
  name: string;
  variants: ABTestVariant[];
  segmentation: any;
  description?: string;
}

export async function saveABTest(
  input: SaveABTestInput
): Promise<{ ok: boolean; error?: string; testId?: string }> {
  try {
    // Validate variants
    if (!input.variants || input.variants.length < 2) {
      return { ok: false, error: 'At least 2 variants are required' };
    }

    // Validate weights sum to 100
    const totalWeight = input.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return { ok: false, error: 'Variant weights must sum to 100' };
    }

    const supabase = await createClient();

    const payload: Record<string, any> = {
      event_id: input.eventId,
      name: input.name.trim(),
      variants: input.variants,
      segmentation: input.segmentation || null,
      status: 'draft',
      updated_at: new Date().toISOString(),
    };

    let result;
    if (input.id) {
      // Update existing test
      const { data, error } = await supabase
        .from('email_ab_tests')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to update AB test: ${error.message}` };
      }

      result = data;
    } else {
      // Create new test
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('email_ab_tests')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to create AB test: ${error.message}` };
      }

      result = data;
    }

    revalidatePath(`/admin/events/${input.eventId}/mail/ab-tests`);

    return { ok: true, testId: result.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

