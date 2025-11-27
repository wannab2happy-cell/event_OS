-- ============================================
-- Event OS - Supabase 보안 설정 SQL (CASCADE 적용 최종 버전)
-- ============================================

-- 0. [필수 해결] 기존 get_claim 함수 및 종속된 RLS 정책을 강제로 삭제합니다.
-- CASCADE를 사용하면 해당 함수에 종속된 모든 정책(Admin full access 등)도 함께 삭제됩니다.
DROP FUNCTION IF EXISTS public.get_claim(text) CASCADE; 

-- ============================================
-- 1. get_claim 함수 생성 (재정의)
-- ============================================
-- 사용자 권한 확인을 위한 헬퍼 함수. role 클레임을 추출합니다.
CREATE OR REPLACE FUNCTION public.get_claim(claim TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>claim, '')::TEXT;
$$;
GRANT EXECUTE ON FUNCTION public.get_claim(text) TO authenticated;


-- ============================================
-- 2. auth_id 컬럼 추가
-- ============================================
ALTER TABLE public.event_participants
ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id);


-- ============================================
-- 3. RLS (Row Level Security) 정책 설정 (EXISTS 구문 사용)
-- ============================================
-- event_participants 테이블에 RLS 활성화
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- 참고: 정책들은 0번에서 CASCADE로 이미 삭제되었으나, 혹시 모를 충돌 방지를 위해 명시적으로 삭제합니다.
DROP POLICY IF EXISTS "Participants can view own data" ON public.event_participants;
DROP POLICY IF EXISTS "Participants can update own data" ON public.event_participants;
DROP POLICY IF EXISTS "Admin full access" ON public.event_participants;
DROP POLICY IF EXISTS "Participants can insert own data" ON public.event_participants;


-- 3-1. [Admin 전용] 관리자는 모든 데이터에 접근 가능하도록 정책 추가
CREATE POLICY "Admin full access"
ON public.event_participants
FOR ALL
TO authenticated
USING (
    (public.get_claim('is_admin') = 'true')
);

-- 3-2. 참가자 SELECT 정책: 자신의 이메일과 일치하는 데이터만 조회 가능
CREATE POLICY "Participants can view own data"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
    EXISTS (
SELECT 1
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.email = event_participants.email
    )
    OR
    (public.get_claim('is_admin') = 'true')
);

-- 3-3. 참가자 UPDATE 정책: 자신의 이메일과 일치하는 데이터만 수정 가능
CREATE POLICY "Participants can update own data"
ON public.event_participants
FOR UPDATE
TO authenticated
USING (
    EXISTS (
SELECT 1
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.email = event_participants.email
    )
    OR
    (public.get_claim('is_admin') = 'true')
)
WITH CHECK (
    EXISTS (
SELECT 1
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.email = event_participants.email
    )
    OR
    (public.get_claim('is_admin') = 'true')
);

-- ============================================
-- 4. admin_notifications 테이블 및 RLS
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.event_participants(id) ON DELETE SET NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 서비스 롤 전용 액세스 (일반 클라이언트 접근 차단)
DROP POLICY IF EXISTS "Admin notifications - service role full access" ON public.admin_notifications;
CREATE POLICY "Admin notifications - service role full access"
ON public.admin_notifications
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');