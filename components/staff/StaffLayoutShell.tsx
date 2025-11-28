import StaffHeader from './StaffHeader';
import StaffSidebar from './StaffSidebar';

interface StaffLayoutShellProps {
  children: React.ReactNode;
  eventId: string;
  eventTitle?: string;
  eventCode?: string;
  staffEmail?: string;
  todaySummary?: {
    totalParticipants?: number;
    checkedIn?: number;
  };
}

export default function StaffLayoutShell({
  children,
  eventId,
  eventTitle,
  eventCode,
  staffEmail,
  todaySummary,
}: StaffLayoutShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader eventTitle={eventTitle} eventCode={eventCode} staffEmail={staffEmail} />
      <StaffSidebar eventId={eventId} todaySummary={todaySummary} />
      <main className="md:ml-64 pt-16">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

