-- Participant가 본인 정보만 조회/수정할 수 있는 정책 추가

-- 1) READ 정책: 본인 이메일 기준
CREATE POLICY IF NOT EXISTS "participant_self_select"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  email = auth.email()
);

-- 2) UPDATE 정책: 본인 이메일 기준
CREATE POLICY IF NOT EXISTS "participant_self_update"
ON public.event_participants
FOR UPDATE
TO authenticated
USING (
  email = auth.email()
)
WITH CHECK (
  email = auth.email()
);

-- 참고: event별 제한이 필요하면 event_id에 대한 추가 조건을 넣을 수 있으나,
-- 현재는 이메일 단위로만 제한 (동일 이메일이 여러 이벤트에 존재하면 모두 접근 가능).
-- 향후 필요시 event_id 기반 세분화 정책 추가 가능.

