/**
 * Event Admin Dashboard Page
 * 
 * Displays comprehensive dashboard for a single event including:
 * - Event header with key information
 * - KPI cards (registrations, checked-in, mail jobs, open rate, table assignment)
 * - Registration trend and mail activity charts
 * - Table status and issues summary
 * - Recent activity feed
 */

import EventDashboardHeader from '@/components/dashboard/EventDashboardHeader';
import KpiCardsRow, { type KpiDefinition } from '@/components/dashboard/KpiCardsRow';
import RegistrationTrendCard from '@/components/dashboard/RegistrationTrendCard';
import MailActivityCard from '@/components/dashboard/MailActivityCard';
import TablesStatusCard from '@/components/dashboard/TablesStatusCard';
import IssuesSummaryCard from '@/components/dashboard/IssuesSummaryCard';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import {
  getRegistrationTrendData,
  getMailActivityData,
  getRecentActivities,
} from '@/lib/dashboard/mockData';

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = await params;
  const eventId = resolvedParams.eventId;

  // Mock event data (in production, fetch from database)
  const eventData = {
    name: 'Annual Tech Conference 2024',
    dateRangeText: '2024년 3월 15일 - 2024년 3월 17일',
    location: 'Seoul Convention Center',
    status: 'active' as const,
  };

  // Mock KPI data
  const kpis: KpiDefinition[] = [
    {
      label: 'Registrations',
      value: 245,
      deltaText: '+12 from last week',
      tone: 'positive',
    },
    {
      label: 'Checked In',
      value: 180,
      deltaText: '73% check-in rate',
      tone: 'neutral',
    },
    {
      label: 'Mail Jobs',
      value: 8,
      deltaText: '2 running',
      tone: 'neutral',
    },
    {
      label: 'Open Rate',
      value: '68%',
      deltaText: '+5% from average',
      tone: 'positive',
    },
    {
      label: 'Table Assignment',
      value: '72%',
      deltaText: '180 / 250 seats',
      tone: 'neutral',
    },
  ];

  // Load mock data
  const registrationTrendData = getRegistrationTrendData();
  const mailActivityData = getMailActivityData();
  const recentActivities = getRecentActivities();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
      {/* Header Section */}
      <EventDashboardHeader
        eventName={eventData.name}
        dateRangeText={eventData.dateRangeText}
        location={eventData.location}
        status={eventData.status}
      />

      {/* KPI Row Section */}
      <KpiCardsRow kpis={kpis} />

      {/* Middle Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RegistrationTrendCard data={registrationTrendData} />
        <MailActivityCard data={mailActivityData} />
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TablesStatusCard totalTables={25} assignedSeats={180} totalCapacity={250} />
          <IssuesSummaryCard />
        </div>
        <RecentActivityList activities={recentActivities} />
      </section>
    </div>
  );
}
