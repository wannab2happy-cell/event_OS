'use client';

import { JobRow } from './JobRow';
import type { EmailJob } from '@/lib/mail/types';

interface JobListProps {
  jobs: EmailJob[];
  templates: Array<{ id: string; name: string }>;
  eventId: string;
}

export function JobList({ jobs, templates, eventId }: JobListProps) {
  const getTemplateName = (templateId: string) => {
    return templates.find((t) => t.id === templateId)?.name;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-600">Job Queue</h3>
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
          <p className="text-sm">작업이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              templateName={getTemplateName(job.template_id)}
              eventId={eventId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

