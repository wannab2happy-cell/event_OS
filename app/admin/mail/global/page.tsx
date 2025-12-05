/**
 * Global Mail Jobs Monitor Page (Phase 6)
 * 
 * Monitor email jobs across all events
 */

import { AdminPage } from '@/components/admin/layout/AdminPage';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import GlobalMailJobsClient from './GlobalMailJobsClient';
import type { EmailJob } from '@/lib/types/mail';

export interface GlobalMailJob extends EmailJob {
  event_title?: string;
  template_name?: string;
}

export default async function GlobalMailJobsPage() {
  // Fetch recent jobs across all events
  const { data: jobs, error } = await supabaseAdmin
    .from('email_jobs')
    .select('*, events!inner(title)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching global mail jobs:', error);
    return <div className="p-8 text-red-500">Failed to load mail jobs</div>;
  }

  // Fetch template names
  const jobIds = jobs?.map((j) => j.id) || [];
  const templateIds = [...new Set(jobs?.map((j) => j.template_id).filter(Boolean) || [])];

  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('id, name')
    .in('id', templateIds);

  const templateMap = new Map(templates?.map((t) => [t.id, t.name]) || []);

  const jobsWithDetails: GlobalMailJob[] = (jobs || []).map((job: any) => ({
    ...job,
    event_title: job.events?.title,
    template_name: templateMap.get(job.template_id),
  }));

  return (
    <AdminPage title="Global Mail Jobs" subtitle="Monitor email jobs across all events">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <GlobalMailJobsClient initialJobs={jobsWithDetails} />
      </div>
    </AdminPage>
  );
}

