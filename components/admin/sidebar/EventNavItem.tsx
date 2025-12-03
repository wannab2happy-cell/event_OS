'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  isActive?: boolean;
}

export function EventNavItem({ href, icon: Icon, label, badge, isActive }: EventNavItemProps) {
  const pathname = usePathname();
  const active = isActive || pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-1.5 text-sm rounded-lg transition-colors relative',
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium'
      )}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
      )}
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          active
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-200 text-gray-700'
        )}>
          {badge}
        </span>
      )}
    </Link>
  );
}

