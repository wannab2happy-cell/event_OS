'use client';

import { useState } from 'react';
import { LayoutDashboard, Users, Table2, Mail, Zap, RefreshCw, TestTube, BarChart3, Settings, MessageSquare, Menu, X } from 'lucide-react';
import { EventNavItem } from './EventNavItem';
import { SectionHeader } from './SectionHeader';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  eventId: string;
}

export function AdminSidebar({ eventId }: AdminSidebarProps) {
  const basePath = `/admin/events/${eventId}`;
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-[260px] bg-gray-50 border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto z-40
          lg:translate-x-0 transition-transform duration-200
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">ANDERS EVENT OS</h1>
        </div>

        <nav className="p-4 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            <EventNavItem
              href={`${basePath}/overview`}
              icon={LayoutDashboard}
              label="Overview"
              isActive={pathname === `${basePath}/overview` || pathname === `${basePath}`}
            />
            <EventNavItem
              href={`${basePath}/participants`}
              icon={Users}
              label="Participants"
            />
            <EventNavItem
              href={`${basePath}/tables`}
              icon={Table2}
              label="Tables"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Messages Section */}
          <div>
            <SectionHeader>Messages</SectionHeader>
            <div className="mt-1 space-y-1 pl-3">
              <EventNavItem
                href={`${basePath}/mail`}
                icon={Mail}
                label="Email Center"
              />
              <EventNavItem
                href={`${basePath}/messages`}
                icon={MessageSquare}
                label="SMS/Kakao"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Automations Section */}
          <div>
            <SectionHeader>Automations</SectionHeader>
            <div className="mt-1 space-y-1 pl-3">
              <EventNavItem
                href={`${basePath}/mail/automations`}
                icon={Zap}
                label="Automations"
              />
              <EventNavItem
                href={`${basePath}/mail/followups`}
                icon={RefreshCw}
                label="Follow-ups"
              />
              <EventNavItem
                href={`${basePath}/mail/ab-tests`}
                icon={TestTube}
                label="A/B Tests"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Analytics */}
          <div className="space-y-1">
            <EventNavItem
              href={`${basePath}/mail/analytics`}
              icon={BarChart3}
              label="Analytics"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* Settings */}
          <div className="space-y-1">
            <EventNavItem
              href={`${basePath}/settings`}
              icon={Settings}
              label="Settings"
            />
          </div>
        </nav>
      </div>
    </>
  );
}
