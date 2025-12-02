'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { runDraftAssignment } from '@/actions/tables/runDraftAssignment';
import { clearDraftAssignment } from '@/actions/tables/clearDraftAssignment';
import { confirmAssignment } from '@/actions/tables/confirmAssignment';
import { TableAssignmentAlgorithm } from '@/lib/tables/assignmentTypes';
import { LoadingSpinner } from './LoadingSpinner';

interface TableAssignmentPanelProps {
  eventId: string;
  algorithm: TableAssignmentAlgorithm;
}

export function TableAssignmentPanel({ eventId, algorithm }: TableAssignmentPanelProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRunDraft = () => {
    startTransition(async () => {
      try {
        await runDraftAssignment({
          eventId,
          algorithm,
        });
        router.refresh();
      } catch (error) {
        console.error('Failed to run draft assignment:', error);
        alert(error instanceof Error ? error.message : 'Failed to run draft assignment');
      }
    });
  };

  const handleClearDraft = () => {
    if (!confirm('임시 배정을 삭제하시겠습니까?')) {
      return;
    }

    startTransition(async () => {
      try {
        await clearDraftAssignment(eventId);
        router.refresh();
      } catch (error) {
        console.error('Failed to clear draft:', error);
        alert(error instanceof Error ? error.message : 'Failed to clear draft');
      }
    });
  };

  const handleConfirm = () => {
    if (!confirm('임시 배정을 확정하시겠습니까? 기존 확정 배정은 삭제됩니다.')) {
      return;
    }

    startTransition(async () => {
      try {
        await confirmAssignment(eventId);
        router.refresh();
      } catch (error) {
        console.error('Failed to confirm assignment:', error);
        alert(error instanceof Error ? error.message : 'Failed to confirm assignment');
      }
    });
  };

  return (
    <div className="flex gap-3 my-4">
      <button
        disabled={isPending}
        onClick={handleRunDraft}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? '처리 중...' : 'Run Draft'}
      </button>

      <button
        disabled={isPending}
        onClick={handleClearDraft}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Clear Draft
      </button>

      <button
        disabled={isPending}
        onClick={handleConfirm}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Confirm
      </button>
    </div>
  );
}

