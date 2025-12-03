import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { SectionCard } from '@/components/ui/section-card';
import {
  getEventEmailStats,
  getJobGroupStats,
  getSegmentationBreakdown,
  getFailureReasons,
  getTimeSeries,
} from '@/lib/mail/analytics';
import { StatCards } from '@/components/mail/analytics/StatCards';
import { SegmentationChart } from '@/components/mail/analytics/SegmentationChart';
import { FailureReasonsChart } from '@/components/mail/analytics/FailureReasonsChart';
import { TimeSeriesChart } from '@/components/mail/analytics/TimeSeriesChart';
import { JobPerformanceTable } from '@/components/mail/analytics/JobPerformanceTable';

type AnalyticsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch all analytics data
  const [stats, jobStats, segmentationBreakdown, failureReasons, timeSeries] = await Promise.all([
    getEventEmailStats(eventId),
    getJobGroupStats(eventId),
    getSegmentationBreakdown(eventId),
    getFailureReasons(eventId),
    getTimeSeries(eventId, 7), // Last 7 days
  ]);

  return (
    <AdminPage title="Analytics" subtitle="Email campaign performance analytics">
      {/* Stat Cards */}
      <StatCards stats={stats} />

      {/* Segmentation Charts */}
      {(segmentationBreakdown.company || segmentationBreakdown.vip || segmentationBreakdown.language) && (
        <SectionCard title="Segmentation Breakdown">
          <SegmentationChart breakdown={segmentationBreakdown} />
        </SectionCard>
      )}

      {/* Failure Reasons & Time Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {failureReasons.length > 0 && (
          <SectionCard title="Failure Analysis">
            <FailureReasonsChart reasons={failureReasons} />
          </SectionCard>
        )}

        {timeSeries.length > 0 && (
          <SectionCard title="Delivery Trends">
            <TimeSeriesChart timeSeries={timeSeries} />
          </SectionCard>
        )}
      </div>

      {/* Job Performance Table */}
      {jobStats.length > 0 && (
        <SectionCard title="Job Performance">
          <JobPerformanceTable jobs={jobStats} eventId={eventId} />
        </SectionCard>
      )}
    </AdminPage>
  );
}

