/**
 * Staff Dashboard Page
 * 
 * On-site operations dashboard for staff
 */

import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, getEventRole } from '@/lib/auth/roles';
import { getDashboardStats } from '@/actions/staff/getDashboardStats';
import StaffDashboardClient from './StaffDashboardClient';

type StaffDashboardPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function StaffDashboardPage({ params }: StaffDashboardPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Get current user
  const userWithRole = await getCurrentUserWithRole();

  if (!userWithRole) {
    redirect('/admin/login');
  }

  // Check if user has staff/admin role for this event
  const eventRole = await getEventRole(eventId, userWithRole.id);

  if (!eventRole || (eventRole !== 'admin' && eventRole !== 'staff')) {
    redirect('/access-denied');
  }

  // Fetch event details
  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('id, title')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return notFound();
  }

  // Fetch initial stats
  const initialStats = await getDashboardStats(eventId);

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffDashboardClient eventId={eventId} eventTitle={event.title} initialStats={initialStats} />
    </div>
  );
}

