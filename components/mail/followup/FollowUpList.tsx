'use client';

import { FollowUpCard } from './FollowUpCard';
import type { EmailFollowUp } from '@/lib/mail/types';

interface FollowUpListProps {
  followups: EmailFollowUp[];
  templates: Map<string, string>; // templateId -> templateName
  jobs: Map<string, string>; // jobId -> jobName
  eventId: string;
  onEdit: (followup: EmailFollowUp) => void;
}

export function FollowUpList({ followups, templates, jobs, eventId, onEdit }: FollowUpListProps) {
  if (followups.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-2">No follow-up campaigns configured</p>
        <p className="text-sm text-gray-400">Create your first follow-up to automate behavior-based emails</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {followups.map((followup) => (
        <FollowUpCard
          key={followup.id}
          followup={followup}
          templateName={templates.get(followup.template_id)}
          baseJobName={jobs.get(followup.base_job_id)}
          eventId={eventId}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

