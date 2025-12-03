import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar';

type EventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventId?: string }>;
};

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return <div>Event ID is required</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar eventId={eventId} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-[260px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
