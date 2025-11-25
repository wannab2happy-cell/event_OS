'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Mail, Settings, Table, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/events', icon: Zap, label: '이벤트 관리' },
  { href: '/admin/events/EVENT_ID/participants', icon: Users, label: '참가자' },
  { href: '/admin/events/EVENT_ID/mail', icon: Mail, label: '메일 센터' },
  { href: '/admin/events/EVENT_ID/tables', icon: Table, label: '테이블 배정' },
  { href: '/admin/settings/zero-cost', icon: Settings, label: 'Zero-Cost 가이드' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const eventIdPlaceholder = 'v1_default';

  const navItems = adminNavItems.map((item) => ({
    ...item,
    href: item.href.replace('EVENT_ID', eventIdPlaceholder),
  }));

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Event<span className="text-blue-600">OS</span>
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname.startsWith(item.href) && item.href !== '/admin/dashboard'
              ? true
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

