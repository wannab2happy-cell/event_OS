'use client';

import { MessageJobRow } from './MessageJobRow';
import type { MessageJob } from '@/lib/mail/types';

interface MessageJobListProps {
  jobs: MessageJob[];
  templates: Map<string, string>; // templateId -> templateName
  eventId: string;
}

export function MessageJobList({ jobs, templates, eventId }: MessageJobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">No message jobs</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <MessageJobRow
          key={job.id}
          job={job}
          templateName={templates.get(job.template_id)}
          eventId={eventId}
        />
      ))}
    </div>
  );
}




