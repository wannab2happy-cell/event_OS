/**
 * Staff Event Dashboard Page
 * 
 * Per-event staff dashboard
 */

import { notFound, redirect } from 'next/navigation';
import { Calendar, MapPin, CheckCircle2, Table, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole, getEventRole } from '@/lib/auth/roles';
import { formatDateKorean } from '@/lib/utils/date';

type StaffEventPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function StaffEventPage({ params }: StaffEventPageProps) {
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
    .select('id, title, start_date, end_date, status')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return notFound();
  }

  const dateRange = `${formatDateKorean(event.start_date)} - ${formatDateKorean(event.end_date)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {event.title} · Staff Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {dateRange} · Your role: <span className="font-medium">{eventRole}</span>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Check-in */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg">Check-in</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage participant check-ins for this event
            </p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </CardContent>
        </Card>

        {/* Seat Map */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Seat Map</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage table assignments
            </p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View today's event schedule and activities
            </p>
            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span>{dateRange}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">{event.status}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

