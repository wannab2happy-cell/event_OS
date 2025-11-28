'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Mail, Settings, Table, Zap, QrCode, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/events', icon: Zap, label: '이벤트 관리' },
  { href: '/admin/events/EVENT_ID/participants', icon: Users, label: '참가자' },
  { href: '/admin/events/EVENT_ID/mail', icon: Mail, label: '메일 센터' },
  { href: '/admin/events/EVENT_ID/tables', icon: Table, label: '테이블 배정' },
  { href: '/admin/events/EVENT_ID/scanner', icon: QrCode, label: '체크인 스캐너' },
  { href: '/admin/events/EVENT_ID/broadcast', icon: Megaphone, label: 'Push 알림' },
  { href: '/admin/settings/zero-cost', icon: Settings, label: 'Zero-Cost 가이드' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  
  // pathname에서 eventId 추출 (예: /admin/events/abc123/participants -> abc123)
  const eventIdMatch = pathname.match(/\/admin\/events\/([^/]+)/);
  const currentEventId = eventIdMatch ? eventIdMatch[1] : null;
  
  // eventId가 없으면 첫 번째 이벤트를 가져오는 대신, 이벤트 관리 페이지로 링크
  // 또는 기본값 사용 (향후 첫 이벤트 자동 선택 기능 추가 가능)
  const eventIdPlaceholder = currentEventId || 'EVENT_ID';

  const navItems = adminNavItems.map((item) => {
    // EVENT_ID가 있으면 현재 eventId로 교체, 없으면 링크를 비활성화하거나 이벤트 선택 페이지로
    let href = item.href;
    if (href.includes('EVENT_ID')) {
      if (currentEventId) {
        href = href.replace('EVENT_ID', currentEventId);
      } else {
        // eventId가 없으면 이벤트 관리 페이지로
        href = '/admin/events';
      }
    }
    return {
      ...item,
      href,
    };
  });

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

