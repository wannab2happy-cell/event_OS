'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StaffHeaderProps {
  eventTitle?: string;
  eventCode?: string;
  staffEmail?: string;
}

export default function StaffHeader({ eventTitle, eventCode, staffEmail }: StaffHeaderProps) {
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/admin/login');
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {eventTitle || 'Event OS'}
          </div>
          {eventCode && (
            <div className="text-xs text-gray-500">{eventCode}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {staffEmail && (
          <span className="text-sm text-gray-600 hidden md:inline">{staffEmail}</span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-red-500">
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">로그아웃</span>
        </Button>
      </div>
    </header>
  );
}

