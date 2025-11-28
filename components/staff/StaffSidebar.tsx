'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  QrCode,
  Users,
  Search,
  Activity,
  Menu,
  X,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaffSidebarProps {
  eventId: string;
  todaySummary?: {
    totalParticipants?: number;
    checkedIn?: number;
  };
}

export default function StaffSidebar({ eventId, todaySummary }: StaffSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      href: `/staff/${eventId}/scan`,
      icon: QrCode,
      label: '체크인 스캐너',
    },
    {
      href: `/staff/${eventId}/participants`,
      icon: Users,
      label: '참가자 리스트',
    },
    {
      href: `/staff/${eventId}/lookup`,
      icon: Search,
      label: '참가자 검색',
    },
    {
      href: `/staff/${eventId}/live-lite`,
      icon: Activity,
      label: '라이브 현황',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Staff Tools</h2>
            {todaySummary && (
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>총 {todaySummary.totalParticipants || 0}명</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>체크인 {todaySummary.checkedIn || 0}명</span>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </aside>
    </>
  );
}

