import React from 'react';
import { headers } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { assertAdminAuth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname =
    headersList.get('x-pathname') ??
    headersList.get('x-matched-path') ??
    headersList.get('x-invoke-path') ??
    headersList.get('next-url') ??
    '';

  // next-url 등은 전체 URL일 수 있으므로 호스트 부분 제거
  const normalizedPath = pathname.replace(/^https?:\/\/[^/]+/, '');
  const isLoginRoute =
    normalizedPath === '/admin/login' || normalizedPath.startsWith('/admin/login?');

  if (isLoginRoute) {
    return <>{children}</>;
  }

  await assertAdminAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

