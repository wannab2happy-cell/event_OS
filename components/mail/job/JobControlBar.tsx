'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Square, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { retryJob } from '@/actions/mail/retryJob';
import { stopJob } from '@/actions/mail/stopJob';
import type { EmailJob } from '@/lib/mail/types';

interface JobControlBarProps {
  job: EmailJob;
  eventId: string;
}

export function JobControlBar({ job, eventId }: JobControlBarProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isRetryingFull, startRetryFull] = useTransition();
  const [isRetryingFailed, startRetryFailed] = useTransition();
  const [isStopping, startStop] = useTransition();

  const handleRetryFull = () => {
    if (!confirm('전체 캠페인을 다시 발송하시겠습니까?')) {
      return;
    }

    startRetryFull(async () => {
      const result = await retryJob({
        jobId: job.id,
        eventId,
        mode: 'full',
      });

      if (result.ok && result.newJobId) {
        success('새로운 재시도 작업이 생성되었습니다.');
        router.push(`/admin/events/${eventId}/mail/jobs/${result.newJobId}`);
      } else {
        error(result.error || '재시도 작업 생성에 실패했습니다.');
      }
    });
  };

  const handleRetryFailed = () => {
    if (job.fail_count === 0) {
      error('실패한 참가자가 없습니다.');
      return;
    }

    if (!confirm(`실패한 ${job.fail_count}명에게만 다시 발송하시겠습니까?`)) {
      return;
    }

    startRetryFailed(async () => {
      const result = await retryJob({
        jobId: job.id,
        eventId,
        mode: 'failed_only',
      });

      if (result.ok && result.newJobId) {
        success('실패한 참가자 재시도 작업이 생성되었습니다.');
        router.push(`/admin/events/${eventId}/mail/jobs/${result.newJobId}`);
      } else {
        error(result.error || '재시도 작업 생성에 실패했습니다.');
      }
    });
  };

  const handleStop = () => {
    if (!confirm('진행 중인 작업을 중단하시겠습니까? 중단된 작업은 재개할 수 없습니다.')) {
      return;
    }

    startStop(async () => {
      const result = await stopJob({
        jobId: job.id,
        eventId,
      });

      if (result.ok) {
        success('작업이 중단되었습니다.');
        router.refresh();
      } else {
        error(result.error || '작업 중단에 실패했습니다.');
      }
    });
  };

  const canStop = job.status === 'processing';
  const canRetry = job.status === 'completed' || job.status === 'failed' || job.status === 'stopped';

  return (
    <Card className="rounded-lg border border-gray-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRetryFull}
            disabled={!canRetry || isRetryingFull || isRetryingFailed}
            variant="primary"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isRetryingFull ? '생성 중...' : 'Retry Entire Job'}
          </Button>

          <Button
            onClick={handleRetryFailed}
            disabled={!canRetry || job.fail_count === 0 || isRetryingFull || isRetryingFailed}
            variant="secondary"
            className="flex-1"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {isRetryingFailed ? '생성 중...' : `Retry Failed Only (${job.fail_count})`}
          </Button>

          <Button
            onClick={handleStop}
            disabled={!canStop || isStopping}
            variant="danger"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            {isStopping ? '중단 중...' : 'Stop Job'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

