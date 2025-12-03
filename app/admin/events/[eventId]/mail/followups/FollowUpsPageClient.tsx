'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FollowUpList } from '@/components/mail/followup/FollowUpList';
import { FollowUpForm } from '@/components/mail/followup/FollowUpForm';
import type { EmailFollowUp } from '@/lib/mail/types';

interface FollowUpsPageClientProps {
  eventId: string;
  initialFollowups: EmailFollowUp[];
  templates: Array<{ id: string; name: string }>;
  jobs: Array<{ id: string; name: string; status: string }>;
  companies: string[];
}

export function FollowUpsPageClient({
  eventId,
  initialFollowups,
  templates,
  jobs,
  companies,
}: FollowUpsPageClientProps) {
  const [followups, setFollowups] = useState(initialFollowups);
  const [showForm, setShowForm] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<EmailFollowUp | null>(null);

  const handleEdit = (followup: EmailFollowUp) => {
    setEditingFollowup(followup);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingFollowup(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    // Refresh page to reload follow-ups
    window.location.reload();
  };

  const templateMap = new Map<string, string>();
  templates.forEach((t) => {
    templateMap.set(t.id, t.name);
  });

  const jobMap = new Map<string, string>();
  jobs.forEach((j) => {
    jobMap.set(j.id, j.name);
  });

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New Follow-Up
        </Button>
      </div>

      {/* Follow-Up List */}
      <FollowUpList
        followups={followups}
        templates={templateMap}
        jobs={jobMap}
        eventId={eventId}
        onEdit={handleEdit}
      />

      {/* Form Modal */}
      {showForm && (
        <FollowUpForm
          followup={editingFollowup}
          eventId={eventId}
          templates={templates}
          jobs={jobs}
          companies={companies}
          onClose={() => {
            setShowForm(false);
            setEditingFollowup(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

