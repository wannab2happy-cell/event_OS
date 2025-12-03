'use client';

import { ABTestCard } from './ABTestCard';
import type { EmailABTest } from '@/lib/mail/types';

interface ABTestListProps {
  tests: EmailABTest[];
  eventId: string;
  onEdit: (test: EmailABTest) => void;
  onViewResults: (test: EmailABTest) => void;
}

export function ABTestList({ tests, eventId, onEdit, onViewResults }: ABTestListProps) {
  if (tests.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-2">No A/B tests configured</p>
        <p className="text-sm text-gray-400">Create your first A/B test to compare email template performance</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {tests.map((test) => (
        <ABTestCard
          key={test.id}
          test={test}
          eventId={eventId}
          onEdit={onEdit}
          onViewResults={onViewResults}
        />
      ))}
    </div>
  );
}

