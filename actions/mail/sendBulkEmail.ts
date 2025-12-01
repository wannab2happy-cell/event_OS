'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailJobStatus, EmailLogStatus } from '@/lib/mail/types';
import { applyTemplateVariables, chunkArray } from '@/lib/mail/utils';
import { sendEmail } from '@/lib/mail/sender';

export async function sendBulkEmail(params: {
  eventId: string;
  templateId: string;
  recipients: { email: string; participantId?: string | null; variables: Record<string, string> }[];
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // 1) 템플릿 불러오기
    const { data: template, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('id', params.templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // 2) email_jobs 생성
    const { data: job, error: jobError } = await supabaseAdmin
      .from('email_jobs')
      .insert({
        event_id: params.eventId,
        template_id: params.templateId,
        status: 'pending' as EmailJobStatus,
        recipient_count: params.recipients.length,
        sent_count: 0,
        failed_count: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create email job: ${jobError?.message || 'Unknown error'}`);
    }

    // 3) 작업 상태를 running으로 업데이트
    await supabaseAdmin
      .from('email_jobs')
      .update({ status: 'running' as EmailJobStatus })
      .eq('id', job.id);

    // 4) 배치 처리
    const batches = chunkArray(params.recipients, 50);
    let sentCount = 0;
    let failedCount = 0;
    const logs: Array<{
      job_id: string;
      participant_id: string | null;
      email: string;
      status: EmailLogStatus | null;
      error_message: string | null;
      sent_at: string | null;
    }> = [];

    for (const batch of batches) {
      for (const item of batch) {
        try {
          const html = applyTemplateVariables(template.body_html || '', item.variables);
          const subject = applyTemplateVariables(template.subject, item.variables);

          const sendResult = await sendEmail({
            to: item.email,
            subject,
            html,
          });

          const isSuccess = sendResult.ok;
          const logStatus: EmailLogStatus | null = isSuccess ? 'success' : 'failed';

          logs.push({
            job_id: job.id,
            participant_id: item.participantId || null,
            email: item.email,
            status: logStatus,
            error_message: isSuccess ? null : (sendResult.error || 'Unknown error'),
            sent_at: isSuccess ? new Date().toISOString() : null,
          });

          if (isSuccess) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (err: any) {
          console.error('Email send error for', item.email, ':', err);
          logs.push({
            job_id: job.id,
            participant_id: item.participantId || null,
            email: item.email,
            status: 'failed',
            error_message: err.message || 'Unknown error',
            sent_at: null,
          });
          failedCount++;
        }
      }

      // 배치 단위로 로그 삽입
      if (logs.length > 0) {
        const { error: logError } = await supabaseAdmin
          .from('email_logs')
          .insert(logs);

        if (logError) {
          console.error('Failed to insert email logs:', logError);
        }

        // 작업 상태 업데이트
        await supabaseAdmin
          .from('email_jobs')
          .update({
            sent_count: sentCount,
            failed_count: failedCount,
          })
          .eq('id', job.id);

        // 로그 배열 초기화
        logs.length = 0;
      }
    }

    // 5) 완료 상태 업데이트
    const finalStatus: EmailJobStatus = failedCount === 0 ? 'completed' : failedCount === params.recipients.length ? 'failed' : 'completed';

    await supabaseAdmin
      .from('email_jobs')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq('id', job.id);

    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error('sendBulkEmail error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

