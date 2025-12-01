-- ===========================================
-- EMAIL TEMPLATES (for managing email templates)
-- ===========================================
create table if not exists public.email_templates (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  subject text not null,
  body_html text,
  variables jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===========================================
-- EMAIL JOBS (represents one bulk send action)
-- ===========================================
create table if not exists public.email_jobs (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  template_id uuid references public.email_templates(id) on delete set null,
  status text default 'pending', -- pending, running, completed, failed
  recipient_count int default 0,
  sent_count int default 0,
  failed_count int default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ===========================================
-- EMAIL LOGS (per-recipient delivery logs)
-- ===========================================
create table if not exists public.email_logs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.email_jobs(id) on delete cascade,
  participant_id uuid references public.event_participants(id) on delete set null,
  email text not null,
  status text, -- success | failed
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Index optimization
create index if not exists idx_email_templates_event_id on public.email_templates(event_id);
create index if not exists idx_email_jobs_event_id on public.email_jobs(event_id);
create index if not exists idx_email_logs_job_id on public.email_logs(job_id);
create index if not exists idx_email_logs_participant on public.email_logs(participant_id);


