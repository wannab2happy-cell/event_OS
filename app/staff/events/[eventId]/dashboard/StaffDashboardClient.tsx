/**
 * Staff Dashboard Client Component
 * 
 * Main dashboard interface for staff
 */

'use client';

'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KpiGrid from '@/components/staff/dashboard/KpiGrid';
import CheckInTrendChart from '@/components/staff/dashboard/CheckInTrendChart';
import RecentCheckIns from '@/components/staff/dashboard/RecentCheckIns';
import VipTracker from '@/components/staff/dashboard/VipTracker';
import QuickSearch from '@/components/staff/dashboard/QuickSearch';
import { getCheckInTrend } from '@/actions/staff/getCheckInTrend';
import { getRecentCheckIns } from '@/actions/staff/getRecentCheckIns';
import type { DashboardStats } from '@/actions/staff/getDashboardStats';
import type { CheckInTrendPoint } from '@/actions/staff/getCheckInTrend';
import type { RecentCheckIn } from '@/actions/staff/getRecentCheckIns';

interface StaffDashboardClientProps {
  eventId: string;
  eventTitle: string;
  initialStats: DashboardStats;
}

export default function StaffDashboardClient({
  eventId,
  eventTitle,
  initialStats,
}: StaffDashboardClientProps) {
  const router = useRouter();
  const [stats] = useState(initialStats);
  const [trend, setTrend] = useState<CheckInTrendPoint[]>([]);
  const [recent, setRecent] = useState<RecentCheckIn[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load trend and recent check-ins
  useEffect(() => {
    startTransition(async () => {
      const [trendData, recentData] = await Promise.all([
        getCheckInTrend(eventId),
        getRecentCheckIns(eventId),
      ]);
      setTrend(trendData);
      setRecent(recentData);
    });
  }, [eventId]);

  const handleParticipantClick = (participantId: string) => {
    // TODO: Open participant drawer or navigate to detail page
    // For now, could navigate to a detail page or open a modal
    console.log('Participant clicked:', participantId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{eventTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">Staff Dashboard</p>
      </div>

      {/* KPI Grid */}
      <KpiGrid stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CheckInTrendChart data={trend} />
        <RecentCheckIns checkIns={recent} onParticipantClick={handleParticipantClick} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VipTracker eventId={eventId} onParticipantClick={handleParticipantClick} />
        <QuickSearch eventId={eventId} onParticipantClick={handleParticipantClick} />
      </div>
    </div>
  );
}

