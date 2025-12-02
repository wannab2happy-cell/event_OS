import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEmailJob, getEmailTemplate } from '@/lib/mail/api';
import { sendEmail } from '@/lib/mail/sender';
import { buildMyTableLink } from '@/lib/mail/linkBuilder';
import { applyMergeVariablesToTemplate } from '@/lib/mail/parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1) Load job
    const jobResult = await getEmailJob(jobId);
    if (jobResult.error || !jobResult.data) {
      return NextResponse.json({ error: jobResult.error || 'Job not found' }, { status: 404 });
    }
    const job = jobResult.data;

    // Check if job is already processing or completed
    if (job.status === 'processing') {
      return NextResponse.json({ error: 'Job is already being processed' }, { status: 400 });
    }
    if (job.status === 'completed') {
      return NextResponse.json({ error: 'Job is already completed' }, { status: 400 });
    }

    // 2) Mark job as processing
    await supabase
      .from('email_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // 3) Load template
    const templateResult = await getEmailTemplate(job.template_id);
    if (templateResult.error || !templateResult.data) {
      await supabase
        .from('email_jobs')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const template = templateResult.data;

    // 4) Load event to get event code
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, code')
      .eq('id', job.event_id)
      .single();

    if (eventError || !event) {
      await supabase
        .from('email_jobs')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 5) Load participants with filters
    let participantsQuery = supabase
      .from('event_participants')
      .select('id, name, email, company_name, is_vip, status')
      .eq('event_id', job.event_id)
      .eq('is_active', true);

    // Apply filters if filter_options exist
    // Note: filter_options is stored in the job creation, but we need to retrieve it
    // For now, we'll load all active participants and filter in JavaScript
    // In a production system, you might want to store filter_options in the job record

    const { data: allParticipants, error: participantsError } = await participantsQuery;

    if (participantsError || !allParticipants) {
      await supabase
        .from('email_jobs')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Failed to load participants' }, { status: 500 });
    }

    // Filter participants (filter_options would be stored in job metadata in a real implementation)
    // For now, we'll process all participants
    let participants = allParticipants;

    // 6) Load table assignments for participants
    const participantIds = participants.map((p) => p.id);
    const { data: assignments } = await supabase
      .from('table_assignments')
      .select('participant_id, table_id')
      .eq('event_id', job.event_id)
      .eq('is_draft', false)
      .in('participant_id', participantIds);

    // Load table names
    const tableIds = assignments?.map((a) => a.table_id).filter(Boolean) || [];
    const { data: tables } = await supabase
      .from('event_tables')
      .select('id, name')
      .eq('event_id', job.event_id)
      .in('id', tableIds);

    const tableMap = new Map(tables?.map((t) => [t.id, t.name]) || []);
    const assignmentMap = new Map(
      assignments?.map((a) => [a.participant_id, a.table_id]) || []
    );

    // 7) Process each participant
    let successCount = 0;
    let failCount = 0;

    for (const participant of participants) {
      try {
        // Build merge variables
        const tableId = assignmentMap.get(participant.id);
        const tableName = tableId ? tableMap.get(tableId) : null;
        const myTableUrl = buildMyTableLink({
          eventCode: event.code,
          participantId: participant.id,
        });

        const mergeVariables = {
          name: participant.name || '',
          company: participant.company_name || '',
          tableName: tableName || 'Unassigned',
          myTableUrl,
        };

        // Apply merge variables to template
        const { html, text } = applyMergeVariablesToTemplate(
          template.body_html,
          template.body_text,
          mergeVariables
        );

        const processedSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return mergeVariables[varName as keyof typeof mergeVariables]?.toString() || match;
        });

        // Send email
        const sendResult = await sendEmail({
          to: participant.email,
          subject: processedSubject,
          html,
          text: text || undefined,
        });

        // Log result
        await supabase.from('email_logs').insert({
          job_id: jobId,
          participant_id: participant.id,
          email: participant.email,
          status: sendResult.success ? 'success' : 'failed',
          error_message: sendResult.success ? null : sendResult.error,
          sent_at: sendResult.success ? new Date().toISOString() : null,
        });

        if (sendResult.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        // Log error for this participant
        await supabase.from('email_logs').insert({
          job_id: jobId,
          participant_id: participant.id,
          email: participant.email,
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
          sent_at: null,
        });
        failCount++;
      }
    }

    // 8) Update job status
    const finalStatus = failCount === participants.length ? 'failed' : 'completed';
    await supabase
      .from('email_jobs')
      .update({
        status: finalStatus,
        success_count: successCount,
        fail_count: failCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      total: participants.length,
      successCount,
      failCount,
    });
  } catch (err) {
    console.error('Error processing email job:', err);

    // Try to mark job as failed
    try {
      const body = await request.json();
      const { jobId } = body;
      if (jobId) {
        const supabase = await createClient();
        await supabase
          .from('email_jobs')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', jobId);
      }
    } catch {
      // Ignore errors in cleanup
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

