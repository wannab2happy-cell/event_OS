'use client';

import { useState, useTransition } from 'react';
import { Edit2, Play, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ABTestStatusBadge } from './ABTestStatusBadge';
import { startABTest } from '@/actions/mail/startABTest';
import { useToast } from '@/components/ui/Toast';
import type { EmailABTest, ABTestVariant } from '@/lib/mail/types';

interface ABTestCardProps {
  test: EmailABTest;
  eventId: string;
  onEdit: (test: EmailABTest) => void;
  onViewResults: (test: EmailABTest) => void;
}

export function ABTestCard({ test, eventId, onEdit, onViewResults }: ABTestCardProps) {
  const { success, error } = useToast();
  const [isStarting, startTest] = useTransition();

  const handleStart = () => {
    if (!confirm('이 A/B 테스트를 시작하시겠습니까? 참가자에게 이메일이 발송됩니다.')) {
      return;
    }

    startTest(async () => {
      const result = await startABTest(test.id);
      if (result.ok) {
        success('A/B 테스트가 시작되었습니다.');
      } else {
        error(result.error || 'A/B 테스트 시작에 실패했습니다.');
      }
    });
  };

  const variants = (test.variants || []) as ABTestVariant[];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{test.name}</h3>
        </div>
        <ABTestStatusBadge status={test.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">Variants:</span>
          {variants.map((variant, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C
            const colors = ['blue', 'green', 'purple'];
            return (
              <span
                key={index}
                className={`px-2 py-0.5 rounded text-xs font-medium bg-${colors[index]}-100 text-${colors[index]}-700`}
              >
                {label} ({variant.weight}%)
              </span>
            );
          })}
        </div>

        {test.status === 'running' && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Status:</span> 테스트 진행 중
          </div>
        )}

        {test.status === 'completed' && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Status:</span> 테스트 완료
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {test.status === 'draft' && (
          <Button onClick={handleStart} disabled={isStarting} variant="primary" size="sm" className="flex-1">
            <Play className="w-4 h-4 mr-1" />
            {isStarting ? 'Starting...' : 'Start Test'}
          </Button>
        )}

        {(test.status === 'running' || test.status === 'completed') && (
          <Button onClick={() => onViewResults(test)} variant="secondary" size="sm" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-1" />
            View Results
          </Button>
        )}

        {test.status !== 'completed' && (
          <Button onClick={() => onEdit(test)} variant="ghost" size="sm" className="flex-1">
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}




