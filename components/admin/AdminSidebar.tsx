'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Mail, Table, Settings } from 'lucide-react';

interface AdminSidebarProps {
  eventId?: string;
}

export default function AdminSidebar({ eventId }: AdminSidebarProps) {
  const pathname = usePathname();

  // eventId가 있으면 이벤트별 메뉴, 없으면 일반 메뉴
  const menu = eventId
    ? [
        { name: '대시보드', href: `/admin/events/${eventId}/dashboard`, icon: LayoutGrid },
        { name: '참가자 관리', href: `/admin/events/${eventId}/participants`, icon: Users },
        { name: '테이블 배정', href: `/admin/events/${eventId}/tables`, icon: Table },
        { name: '메일 센터', href: `/admin/events/${eventId}/mail`, icon: Mail },
        { name: '설정', href: `/admin/events/${eventId}/settings`, icon: Settings },
      ]
    : [
        { name: '이벤트 관리', href: '/admin/events', icon: LayoutGrid },
      ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-4 sticky top-0">
      <div className="text-xl font-bold mb-8">EventOS Admin</div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/admin/events' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${active ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
