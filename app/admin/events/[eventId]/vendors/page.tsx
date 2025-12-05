/**
 * Vendor Workspace Page
 * 
 * Internal vendor control board for event admins
 */

import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, isEventAdmin } from '@/lib/auth/roles';
import { getVendorNotes } from '@/actions/vendors/getVendorNotes';
import VendorWorkspaceClient from './VendorWorkspaceClient';
import type { VendorNote } from '@/lib/vendors/vendorTypes';

type VendorWorkspacePageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function VendorWorkspacePage({ params }: VendorWorkspacePageProps) {
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

  // Verify user is event admin
  const isAdmin = await isEventAdmin(eventId, userWithRole.id);
  if (!isAdmin) {
    redirect('/access-denied');
  }

  // Fetch event details
  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('id, title, start_date, end_date')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return notFound();
  }

  // Fetch all vendor notes
  const initialNotes = await getVendorNotes(eventId);

  // Format date range
  const eventDateRange =
    event.start_date && event.end_date
      ? `${new Date(event.start_date).toLocaleDateString('ko-KR')} - ${new Date(event.end_date).toLocaleDateString('ko-KR')}`
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorWorkspaceClient
        eventId={eventId}
        eventName={event.title}
        eventDateRange={eventDateRange}
        initialNotes={initialNotes}
      />
    </div>
  );
}

