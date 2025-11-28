-- Table Assignment Engine v2: Draft/메타 필드 추가

-- table_assignments 확장
ALTER TABLE public.table_assignments
  ADD COLUMN IF NOT EXISTS is_draft boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS batch_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_by text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz DEFAULT now();

-- 인덱스 추가 (Draft 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_table_assignments_is_draft 
  ON public.table_assignments(event_id, is_draft);

-- 코멘트
COMMENT ON COLUMN public.table_assignments.is_draft IS '초안 배정 여부 (true: Draft, false: 확정)';
COMMENT ON COLUMN public.table_assignments.source IS '배정 소스: auto_round_robin, auto_vip_spread, auto_group_by_company, manual_drag';
COMMENT ON COLUMN public.table_assignments.batch_id IS '배정 실행 단위 식별자 (같은 배정 실행에서 생성된 배정은 같은 batch_id)';
COMMENT ON COLUMN public.table_assignments.assigned_by IS '배정한 관리자 이메일';
COMMENT ON COLUMN public.table_assignments.assigned_at IS '배정 시각';

-- tables 확장 (선택적, 향후 사용 가능)
-- ALTER TABLE public.tables
--   ADD COLUMN IF NOT EXISTS is_vip_table boolean DEFAULT false,
--   ADD COLUMN IF NOT EXISTS tags text[];

