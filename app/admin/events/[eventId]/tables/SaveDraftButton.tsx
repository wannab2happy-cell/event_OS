'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveDraftManualOverride } from '@/actions/tables/saveDraftManualOverride';

interface SaveDraftButtonProps {
  eventId: string;
  assignments: { tableId: string; participantId: string }[];
}

export function SaveDraftButton({ eventId, assignments }: SaveDraftButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveDraftManualOverride({ eventId, assignments });
        router.refresh();
      } catch (error) {
        console.error('Failed to save draft changes:', error);
        alert(error instanceof Error ? error.message : 'Failed to save draft changes');
      }
    });
  };

  return (
    <button
      disabled={isPending || assignments.length === 0}
      onClick={handleSave}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isPending ? 'Saving...' : 'Save Draft Changes'}
    </button>
  );
}

