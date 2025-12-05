/**
 * KPI Grid Component
 * 
 * Displays a grid of KPI cards
 */

import { Users, CheckCircle2, XCircle, Crown, Table } from 'lucide-react';
import KpiCard from './KpiCard';
import type { DashboardStats } from '@/actions/staff/getDashboardStats';

interface KpiGridProps {
  stats: DashboardStats;
}

export default function KpiGrid({ stats }: KpiGridProps) {
  const checkInRate = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;
  const vipArrivalRate = stats.vipTotal > 0 ? Math.round((stats.vipArrived / stats.vipTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard
        label="Total"
        value={stats.total}
        icon={Users}
        color="blue"
        subtitle="Participants"
      />
      <KpiCard
        label="Checked In"
        value={stats.checkedIn}
        icon={CheckCircle2}
        color="green"
        subtitle={`${checkInRate}%`}
      />
      <KpiCard
        label="Not Arrived"
        value={stats.notArrived}
        icon={XCircle}
        color="yellow"
        subtitle={`${100 - checkInRate}%`}
      />
      <KpiCard
        label="VIP Total"
        value={stats.vipTotal}
        icon={Crown}
        color="purple"
        subtitle="VIP guests"
      />
      <KpiCard
        label="VIP Arrived"
        value={stats.vipArrived}
        icon={Crown}
        color="green"
        subtitle={`${vipArrivalRate}%`}
      />
      <KpiCard
        label="Assigned"
        value={`${stats.assignmentRate}%`}
        icon={Table}
        color="blue"
        subtitle="Table assignment"
      />
    </div>
  );
}

