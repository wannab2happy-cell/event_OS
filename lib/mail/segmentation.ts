/**
 * Mail Segmentation Engine
 * 
 * Provides utilities for building participant queries based on segmentation rules
 */

import { createClient } from '@/lib/supabase/server';

export type SegmentationType =
  | 'all'
  | 'registered_only'
  | 'invited_only'
  | 'vip_only'
  | 'company'
  | 'language'
  | 'custom';

export interface SegmentationRule {
  type: SegmentationType;
  values?: string[]; // For company, language, etc.
}

export interface SegmentationConfig {
  rules: SegmentationRule[];
}

/**
 * Build Supabase query conditions based on segmentation rules
 * 
 * @param eventId - Event ID
 * @param segmentation - Segmentation configuration
 * @returns Query builder with applied filters (not executed)
 */
export async function buildSegmentQuery(eventId: string, segmentation: SegmentationConfig) {
  const supabase = await createClient();
  let query = supabase
    .from('event_participants')
    .select('id, email, name, company, status, is_vip, language')
    .eq('event_id', eventId)
    .eq('is_active', true);

  // Apply segmentation rules
  for (const rule of segmentation.rules) {
    switch (rule.type) {
      case 'all':
        // No additional filter needed
        break;

      case 'registered_only':
        query = query.eq('status', 'registered');
        break;

      case 'invited_only':
        query = query.eq('status', 'invited');
        break;

      case 'vip_only':
        query = query.eq('is_vip', true);
        break;

      case 'company':
        if (rule.values && rule.values.length > 0) {
          query = query.in('company', rule.values);
        }
        break;

      case 'language':
        if (rule.values && rule.values.length > 0) {
          query = query.in('language', rule.values);
        }
        break;

      case 'custom':
        // Future extension - stub for now
        // Could parse SQL-like conditions or use a more complex filter builder
        break;

      default:
        // Unknown segmentation type - skip
        break;
    }
  }

  return query;
}

/**
 * Get count of participants matching segmentation rules
 * 
 * @param eventId - Event ID
 * @param segmentation - Segmentation configuration
 * @returns Count of matching participants
 */
export async function getSegmentCount(
  eventId: string,
  segmentation: SegmentationConfig
): Promise<number> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('is_active', true);

    // Apply segmentation rules
    for (const rule of segmentation.rules) {
      switch (rule.type) {
        case 'all':
          // No additional filter needed
          break;

        case 'registered_only':
          query = query.eq('status', 'registered');
          break;

        case 'invited_only':
          query = query.eq('status', 'invited');
          break;

        case 'vip_only':
          query = query.eq('is_vip', true);
          break;

        case 'company':
          if (rule.values && rule.values.length > 0) {
            query = query.in('company', rule.values);
          }
          break;

        case 'language':
          if (rule.values && rule.values.length > 0) {
            query = query.in('language', rule.values);
          }
          break;

        case 'custom':
          // Future extension - stub for now
          break;

        default:
          // Unknown segmentation type - skip
          break;
      }
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting segment:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in getSegmentCount:', err);
    return 0;
  }
}

/**
 * Get list of unique companies from participants
 * 
 * @param eventId - Event ID
 * @returns Array of company names
 */
export async function getParticipantCompanies(eventId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('event_participants')
      .select('company')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .not('company', 'is', null);

    if (error) {
      console.error('Error fetching companies:', error);
      return [];
    }

    // Extract unique company names
    const companies = new Set<string>();
    (data || []).forEach((p) => {
      if (p.company) {
        companies.add(p.company);
      }
    });

    return Array.from(companies).sort();
  } catch (err) {
    console.error('Error in getParticipantCompanies:', err);
    return [];
  }
}

