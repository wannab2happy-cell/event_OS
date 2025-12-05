/**
 * Job Progress Bar Component
 * 
 * Visual progress indicator for email jobs
 */

'use client';

interface JobProgressBarProps {
  total: number;
  processed: number;
  success: number;
  failed: number;
}

export default function JobProgressBar({ total, processed, success, failed }: JobProgressBarProps) {
  const processedPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
  const successPercent = total > 0 ? Math.round((success / total) * 100) : 0;
  const failedPercent = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{processedPercent}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full flex">
          {successPercent > 0 && (
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${successPercent}%` }}
            />
          )}
          {failedPercent > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${failedPercent}%` }}
            />
          )}
          {processedPercent < 100 && (
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${processedPercent - successPercent - failedPercent}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

