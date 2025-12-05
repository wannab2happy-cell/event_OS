/**
 * RBAC (Role-Based Access Control) Utilities
 * 
 * Global and per-event role management
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@/lib/supabase/server';

/**
 * Global application roles
 */
export type AppRole =
  | 'super_admin'
  | 'event_manager'
  | 'operations_staff'
  | 'guest_viewer'
  | 'vendor';

/**
 * Per-event roles
 */
export type EventRole = 'admin' | 'staff' | 'vendor';

/**
 * User with role information
 */
export interface UserWithRole {
  id: string;
  email?: string;
  full_name?: string;
  role: AppRole;
}

/**
 * Get current user with role
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Fetch profile with role
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      // If profile doesn't exist, create one with default role
      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'guest_viewer',
        })
        .select()
        .single();

      if (!newProfile) {
        return null;
      }

      return {
        id: newProfile.id,
        email: newProfile.email || undefined,
        full_name: newProfile.full_name || undefined,
        role: (newProfile.role as AppRole) || 'guest_viewer',
      };
    }

    return {
      id: profile.id,
      email: profile.email || undefined,
      full_name: profile.full_name || undefined,
      role: (profile.role as AppRole) || 'guest_viewer',
    };
  } catch (err) {
    console.error('Error getting current user with role:', err);
    return null;
  }
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(userRole: AppRole, allowed: AppRole[]): boolean {
  return allowed.includes(userRole);
}

/**
 * Assert that user has one of the allowed roles
 * Throws if not allowed
 */
export function assertRole(userRole: AppRole, allowed: AppRole[]): void {
  if (!hasRole(userRole, allowed)) {
    throw new Error(`Access denied. Required roles: ${allowed.join(', ')}`);
  }
}

/**
 * Get event role for a user
 */
export async function getEventRole(
  eventId: string,
  userId: string
): Promise<EventRole | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_staff_roles')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as EventRole;
  } catch (err) {
    console.error('Error getting event role:', err);
    return null;
  }
}

/**
 * Check if user is event admin
 */
export async function isEventAdmin(
  eventId: string,
  userId: string
): Promise<boolean> {
  const role = await getEventRole(eventId, userId);
  return role === 'admin';
}

/**
 * Check if user is event staff
 */
export async function isEventStaff(
  eventId: string,
  userId: string
): Promise<boolean> {
  const role = await getEventRole(eventId, userId);
  return role === 'admin' || role === 'staff';
}

/**
 * Check if user is event vendor
 */
export async function isEventVendor(
  eventId: string,
  userId: string
): Promise<boolean> {
  const role = await getEventRole(eventId, userId);
  return role === 'vendor';
}

/**
 * Check if user has any event role
 */
export async function hasEventRole(
  eventId: string,
  userId: string
): Promise<boolean> {
  const role = await getEventRole(eventId, userId);
  return role !== null;
}

