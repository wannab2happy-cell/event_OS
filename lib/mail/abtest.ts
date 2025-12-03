/**
 * Email A/B Testing Library
 * 
 * Provides utilities for managing A/B test experiments
 */

import { createClient } from '@/lib/supabase/server';
import type { EmailABTest, ABTestVariant, ABTestAssignment, ABTestStatus } from './types';
import type { SegmentationConfig } from './segmentation';
import { buildSegmentQuery } from './segmentation';

/**
 * Get all A/B tests for an event
 */
export async function getABTestsForEvent(eventId: string): Promise<EmailABTest[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_ab_tests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AB tests:', error);
      return [];
    }

    return (data || []) as EmailABTest[];
  } catch (err) {
    console.error('Error in getABTestsForEvent:', err);
    return [];
  }
}

/**
 * Get a single A/B test by ID
 */
export async function getABTest(id: string): Promise<EmailABTest | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_ab_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as EmailABTest;
  } catch (err) {
    console.error('Error in getABTest:', err);
    return null;
  }
}

/**
 * Randomly assign participants to variants based on weights
 * 
 * @param participants - Array of participant IDs
 * @param variants - Array of variants with weights
 * @returns Map of participant_id -> variant_index
 */
export function assignParticipantsToVariants(
  participants: string[],
  variants: ABTestVariant[]
): Map<string, number> {
  const assignments = new Map<string, number>();

  // Normalize weights to ensure they sum to 100
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const normalizedWeights = variants.map((v) => (v.weight / totalWeight) * 100);

  // Calculate cumulative weights
  const cumulativeWeights: number[] = [];
  let cumulative = 0;
  for (const weight of normalizedWeights) {
    cumulative += weight;
    cumulativeWeights.push(cumulative);
  }

  // Assign each participant to a variant
  for (const participantId of participants) {
    const random = Math.random() * 100;
    let variantIndex = 0;
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (random <= cumulativeWeights[i]) {
        variantIndex = i;
        break;
      }
    }
    assignments.set(participantId, variantIndex);
  }

  return assignments;
}

/**
 * Get assignments for a test
 */
export async function getABTestAssignments(testId: string): Promise<ABTestAssignment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_ab_assignments')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AB test assignments:', error);
      return [];
    }

    return (data || []) as ABTestAssignment[];
  } catch (err) {
    console.error('Error in getABTestAssignments:', err);
    return [];
  }
}

/**
 * Create assignments for a test
 */
export async function createABTestAssignments(
  testId: string,
  assignments: Map<string, number>
): Promise<void> {
  try {
    const supabase = await createClient();
    const assignmentRecords = Array.from(assignments.entries()).map(([participantId, variantIndex]) => ({
      test_id: testId,
      participant_id: participantId,
      variant_index: variantIndex,
      job_id: '', // Will be updated when jobs are created
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('email_ab_assignments').insert(assignmentRecords);

    if (error) {
      console.error('Error creating AB test assignments:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error in createABTestAssignments:', err);
    throw err;
  }
}

/**
 * Update assignment with job_id
 */
export async function updateAssignmentJobId(
  testId: string,
  participantId: string,
  variantIndex: number,
  jobId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('email_ab_assignments')
      .update({ job_id: jobId })
      .eq('test_id', testId)
      .eq('participant_id', participantId)
      .eq('variant_index', variantIndex);
  } catch (err) {
    console.error('Error updating assignment job_id:', err);
  }
}

/**
 * Update AB test status
 */
export async function updateABTestStatus(
  testId: string,
  status: ABTestStatus
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('email_ab_tests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', testId);
  } catch (err) {
    console.error('Error updating AB test status:', err);
  }
}

/**
 * Get participants for a test based on segmentation
 */
export async function getParticipantsForABTest(
  eventId: string,
  segmentation: SegmentationConfig
): Promise<string[]> {
  try {
    const query = await buildSegmentQuery(eventId, segmentation);
    // buildSegmentQuery already includes select, so we execute it directly
    const { data: participants } = await query;

    if (!participants) {
      return [];
    }

    return participants.map((p: any) => p.id);
  } catch (err) {
    console.error('Error in getParticipantsForABTest:', err);
    return [];
  }
}

