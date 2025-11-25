'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminHeader() {
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
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div className="text-lg font-semibold text-gray-700">관리자 콘솔</div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-red-500">
        <LogOut className="h-4 w-4 mr-2" />
        로그아웃
      </Button>
    </header>
  );
}

