/**
 * Staff Console Layout
 * 
 * Layout for all staff routes
 */

import Link from 'next/link';
import { Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Staff Console</h1>
            </div>
            <nav className="flex items-center gap-2">
              <Link href="/staff">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">{children}</main>
    </div>
  );
}

