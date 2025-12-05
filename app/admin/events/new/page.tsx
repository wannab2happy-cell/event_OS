/**
 * Create Event Page (Phase 6)
 * 
 * Event creation wizard
 */

import { AdminPage } from '@/components/admin/layout/AdminPage';
import EventCreateWizard from '@/components/events/EventCreateWizard';

export default function CreateEventPage() {
  return (
    <AdminPage title="Create Event" subtitle="Set up a new event">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <EventCreateWizard />
      </div>
    </AdminPage>
  );
}

