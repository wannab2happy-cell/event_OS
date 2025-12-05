/**
 * Staff Console Home Page
 * 
 * Lists events where the current user has staff/admin role
 */

import { notFound, redirect } from 'next/navigation';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth/roles';
import { formatDateKorean } from '@/lib/utils/date';
import Link from 'next/link';

export default async function StaffHomePage() {
  // Get current user with role
  const userWithRole = await getCurrentUserWithRole();

  if (!userWithRole) {
    redirect('/admin/login');
  }

  // Fetch events where user has staff/admin role
  const { data: eventRoles, error } = await supabaseAdmin
    .from('event_staff_roles')
    .select('role, event_id')
    .eq('user_id', userWithRole.id)
    .in('role', ['admin', 'staff']);

  if (error || !eventRoles || eventRoles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Events where you have staff or admin access
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events assigned to you yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch event details
  const eventIds = eventRoles.map((er) => er.event_id);
  const { data: eventsData, error: eventsError } = await supabaseAdmin
    .from('events')
    .select('id, title, start_date, end_date, status')
    .in('id', eventIds);

  if (eventsError || !eventsData) {
    console.error('Error fetching events:', eventsError);
    return <div className="p-8 text-red-500">Failed to load events</div>;
  }

  // Map event roles to events
  const roleMap = new Map(eventRoles.map((er) => [er.event_id, er.role]));
  const events = eventsData.map((event) => ({
    id: event.id,
    title: event.title,
    start_date: event.start_date,
    end_date: event.end_date,
    status: event.status,
    staffRole: roleMap.get(event.id) || 'staff',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Events where you have staff or admin access
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const dateRange = `${formatDateKorean(event.start_date)} - ${formatDateKorean(
              event.end_date
            )}`;

            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant={event.staffRole === 'admin' ? 'success' : 'info'}>
                      {event.staffRole}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{dateRange}</span>
                  </div>
                  <Link href={`/staff/events/${event.id}`} className="block">
                    <Button variant="primary" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Staff Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

