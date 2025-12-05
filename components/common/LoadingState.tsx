/**
 * Loading State Component
 * 
 * Displays loading state with optional message
 */

'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = '로딩 중...',
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 z-50'
    : 'flex flex-col items-center justify-center py-12 px-4';

  return (
    <div className={containerClass}>
      <LoadingSpinner />
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

