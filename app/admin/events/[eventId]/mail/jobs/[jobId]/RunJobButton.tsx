'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RunJobButtonProps {
  jobId: string;
  jobStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export function RunJobButton({ jobId, jobStatus }: RunJobButtonProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRunJob = async () => {
    if (jobStatus === 'processing') {
      setMessage({ type: 'error', text: 'Job is already being processed' });
      return;
    }

    if (jobStatus === 'completed') {
      if (!confirm('This job is already completed. Do you want to run it again?')) {
        return;
      }
    }

    setIsRunning(true);
    setMessage(null);

    try {
      const response = await fetch('/api/mail/run-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to run job' });
        setIsRunning(false);
        return;
      }

      setMessage({
        type: 'success',
        text: `Job completed: ${data.successCount} succeeded, ${data.failCount} failed`,
      });

      // Refresh page after a short delay to show updated status
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const isDisabled = isRunning || jobStatus === 'processing';

  return (
    <div className="space-y-2">
      <Button
        onClick={handleRunJob}
        disabled={isDisabled}
        className="flex items-center gap-2"
        variant={jobStatus === 'completed' ? 'secondary' : 'primary'}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {jobStatus === 'completed' ? 'Run Again' : 'Run Job'}
          </>
        )}
      </Button>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-rose-50 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}

