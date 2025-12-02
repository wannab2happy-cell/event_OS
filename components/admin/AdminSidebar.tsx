'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  CalendarCheck,
  Users,
  Mail,
  Table,
} from 'lucide-react';

const menu = [
  { name: '대시보드', href: '/admin/dashboard', icon: LayoutGrid },
  { name: '이벤트 관리', href: '/admin/events', icon: CalendarCheck },
  { name: '참가자 관리', href: '/admin/participants', icon: Users },
  { name: '메일 센터', href: '/admin/mail', icon: Mail },
  { name: '테이블 배정', href: '/admin/tables', icon: Table },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-4 sticky top-0">
      <div className="text-xl font-bold mb-8">EventOS Admin</div>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
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
