// FILE: lib/mail/types.ts

export type EmailTemplate = {
  id: string;
  event_id: string;
  name: string;
  subject: string;
  body_html: string | null;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type EmailJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export type EmailJob = {
  id: string;
  event_id: string;
  template_id: string | null;
  status: EmailJobStatus;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type EmailLogStatus = "success" | "failed";

export type EmailLog = {
  id: string;
  job_id: string;
  participant_id: string | null;
  email: string;
  status: EmailLogStatus | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};


