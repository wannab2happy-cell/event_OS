'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: number;
  label: string;
  slug: string;
}

const steps: ProgressStep[] = [
  { id: 1, label: '기본 정보', slug: 'basic-info' },
  { id: 2, label: '여권/비자', slug: 'passport' },
  { id: 3, label: '항공 정보', slug: 'flight' },
  { id: 4, label: '호텔 정보', slug: 'hotel' },
  { id: 5, label: '요청 사항', slug: 'requests' },
  { id: 6, label: '동행인', slug: 'companions' },
];

export default function RegistrationProgress({
  eventId,
  currentStepSlug,
}: {
  eventId: string;
  currentStepSlug: string;
}) {
  const currentStepIndex = steps.findIndex((s) => s.slug === currentStepSlug);
  const totalSteps = steps.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-white shadow-md rounded-xl p-4 md:p-6 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Progress</p>
          <h2 className="text-xl font-bold text-gray-900">참가 정보 등록 현황</h2>
        </div>
        <span className="text-sm font-semibold text-[var(--primary)]">
          {currentStepIndex + 1}/{totalSteps}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>{steps[currentStepIndex]?.label || '요약'}</span>
          <span className="text-[var(--primary)] font-bold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--primary)' }}
          ></div>
        </div>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {steps.map((step, index) => {
          const isActive = step.slug === currentStepSlug;
          const isCompleted = index < currentStepIndex;
          return (
            <li key={step.id}>
              <Link
                href={`/${eventId}/register?step=${step.slug}`}
                className={cn(
                  'flex flex-col p-3 rounded-lg border transition-colors duration-150 text-left',
                  isActive
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                <span
                  className={cn(
                    'text-xs font-semibold mb-1',
                    isActive ? 'text-white/80' : isCompleted ? 'text-green-500' : 'text-gray-500'
                  )}
                >
                  {isCompleted ? '완료' : isActive ? '진행 중' : '미입력'}
                </span>
                <span className="text-base font-bold">{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

