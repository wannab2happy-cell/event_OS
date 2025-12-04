'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ title = '오류가 발생했습니다', message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-red-900">{title}</h3>
        </div>
        <p className="text-sm text-red-700 mb-4">{message}</p>
        {action && (
          <Button onClick={action.onClick} variant="primary" className="w-full">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}




