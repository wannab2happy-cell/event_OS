/**
 * Staff Check-in Page
 * 
 * QR-based check-in app for on-site operations
 */

import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, getEventRole } from '@/lib/auth/roles';
import CheckInClient from './CheckInClient';

type CheckInPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function CheckInPage({ params }: CheckInPageProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckInClient eventId={eventId} eventTitle={event.title} />
    </div>
  );
}

