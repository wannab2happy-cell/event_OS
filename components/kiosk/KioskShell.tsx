'use client';

import { useState } from 'react';
import { QrCode, Search } from 'lucide-react';
import KioskQrCheckin from './KioskQrCheckin';
import KioskSearchCheckin from './KioskSearchCheckin';

interface Event {
  id: string;
  title: string;
  code: string;
  primary_color?: string | null;
}

interface KioskShellProps {
  event: Event;
  eventId: string;
}

type TabType = 'qr' | 'search';

export default function KioskShell({ event, eventId }: KioskShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('qr');

  const primaryColor = event.primary_color || '#2563eb';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header
        className="px-6 py-8 text-center border-b-4"
        style={{ borderColor: primaryColor }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
        <p className="text-2xl text-gray-600">Self Check-in</p>
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-6 text-2xl font-semibold transition-colors ${
            activeTab === 'qr'
              ? 'text-white border-b-4'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={
            activeTab === 'qr'
              ? {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }
              : {}
          }
        >
          <div className="flex items-center justify-center gap-3">
            <QrCode className="h-8 w-8" />
            QR 체크인
          </div>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-6 text-2xl font-semibold transition-colors ${
            activeTab === 'search'
              ? 'text-white border-b-4'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          style={
            activeTab === 'search'
              ? {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }
              : {}
          }
        >
          <div className="flex items-center justify-center gap-3">
            <Search className="h-8 w-8" />
            이름 검색
          </div>
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex items-center justify-center p-8">
        {activeTab === 'qr' ? (
          <KioskQrCheckin eventId={eventId} primaryColor={primaryColor} />
        ) : (
          <KioskSearchCheckin eventId={eventId} primaryColor={primaryColor} />
        )}
      </main>

      {/* 푸터 */}
      <footer className="px-6 py-6 text-center border-t border-gray-200">
        <p className="text-lg text-gray-500">Powered by ANDERS Event OS</p>
      </footer>
    </div>
  );
}

