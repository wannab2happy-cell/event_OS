import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

type AdminEventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
};

export default async function AdminEventLayout({ children, params }: AdminEventLayoutProps) {
  const resolved = await params;
  const eventId = resolved.eventId;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar eventId={eventId} />

      <div className="flex-1 flex flex-col">
        <AdminHeader eventId={eventId} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

