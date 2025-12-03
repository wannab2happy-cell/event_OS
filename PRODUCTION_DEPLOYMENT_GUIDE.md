# Event OS Admin — Production Deployment Guide

**Step 23: 최종 배포 절차**

배포 완료 시간: 약 30-45분 (DNS 전파 시간 제외)

---

## 📋 배포 전 체크리스트

- [ ] Step 22 완료 확인 (빌드 성공, 경고만 5개)
- [ ] Git repository 최신 상태 (`git status` 확인)
- [ ] Supabase 계정 준비
- [ ] Resend 계정 준비
- [ ] Vercel 계정 준비
- [ ] 도메인 DNS 접근 권한 확보
- [ ] `CRON_SECRET` 생성 준비 (32자 이상 랜덤 문자열)

---

## 1️⃣ Supabase Production 환경 구성

### 1.1 새로운 Production 프로젝트 생성

1. **Supabase Dashboard 접속**
   - URL: https://app.supabase.com
   - "New Project" 클릭

2. **프로젝트 설정**
   ```
   Project Name: event-os-prod
   Database Password: [안전한 비밀번호 생성]
   Region: ap-northeast-2 (Tokyo) 또는 us-west-2 (Oregon)
   Pricing Plan: Free 또는 Pro
   ```

3. **프로젝트 생성 대기** (약 2-3분)

### 1.2 데이터베이스 스키마 마이그레이션

**Option A: SQL Editor 사용 (권장)**

Supabase Dashboard → SQL Editor → New Query 생성 후 아래 SQL 실행:

```sql
-- 1. Events 테이블
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  venue_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Event Participants 테이블
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  position TEXT,
  phone TEXT,
  status TEXT DEFAULT 'invited',
  is_vip BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'ko',
  is_travel_confirmed BOOLEAN DEFAULT false,
  is_accommodation_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- 3. Email Templates 테이블
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  merge_variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Email Jobs 테이블
CREATE TABLE IF NOT EXISTS email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  segmentation JSONB DEFAULT '{}',
  total_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Email Logs 테이블
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES email_jobs(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Email Automations 테이블
CREATE TABLE IF NOT EXISTS email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  time_type TEXT,
  send_at TIMESTAMP WITH TIME ZONE,
  relative_days INTEGER,
  trigger_kind TEXT,
  segmentation JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Email Follow-ups 테이블
CREATE TABLE IF NOT EXISTS email_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  base_job_id UUID REFERENCES email_jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  delay_hours INTEGER DEFAULT 0,
  segmentation JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Email A/B Tests 테이블
CREATE TABLE IF NOT EXISTS email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variants JSONB NOT NULL,
  segmentation JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Email A/B Assignments 테이블
CREATE TABLE IF NOT EXISTS email_ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES email_ab_tests(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
  variant_index INTEGER NOT NULL,
  job_id UUID REFERENCES email_jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, participant_id)
);

-- 10. Message Templates 테이블
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Message Jobs 테이블
CREATE TABLE IF NOT EXISTS message_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  segmentation JSONB DEFAULT '{}',
  total_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Message Logs 테이블
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES message_jobs(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES event_participants(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON event_participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_company ON event_participants(company);
CREATE INDEX IF NOT EXISTS idx_participants_status ON event_participants(status);

CREATE INDEX IF NOT EXISTS idx_email_jobs_event_id ON email_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON email_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_job_id ON email_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_participant_id ON email_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

CREATE INDEX IF NOT EXISTS idx_message_jobs_event_id ON message_jobs(event_id);
CREATE INDEX IF NOT EXISTS idx_message_jobs_status ON message_jobs(status);

-- RLS (Row Level Security) 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (Admin 전용 - 향후 Auth 통합 시 수정 필요)
-- 현재는 Service Role Key 사용으로 인해 모든 작업 허용
-- 프로덕션에서는 Auth와 통합 후 정책 강화 필요
```

### 1.3 Production Keys 확보

Supabase Dashboard → Settings → API 에서 아래 3개 복사:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (절대 노출 금지)
```

**⚠️ 중요**: `SUPABASE_SERVICE_ROLE_KEY`는 **절대 클라이언트나 Git에 노출하지 마세요!**

---

## 2️⃣ Resend Production 설정

### 2.1 Production API Key 생성

1. **Resend Dashboard 접속**
   - URL: https://resend.com/dashboard

2. **API Key 생성**
   - API Keys → Create API Key
   - Name: `event-os-prod`
   - Permission: `Sending access`
   - Domain: `anders.kr` (또는 사용할 도메인)

3. **API Key 복사**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2.2 도메인 인증 (필수)

**도메인 선택**: `anders.kr` 또는 `mail.anders.kr`

1. **Resend Dashboard → Domains → Add Domain**

2. **DNS 레코드 추가** (도메인 제공업체에서 설정)

   **SPF 레코드** (TXT)
   ```
   Type: TXT
   Host: @
   Value: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   ```

   **DKIM 레코드** (TXT)
   ```
   Type: TXT
   Host: resend._domainkey
   Value: [Resend가 제공하는 값]
   TTL: 3600
   ```

   **DMARC 레코드** (TXT)
   ```
   Type: TXT
   Host: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@anders.kr
   TTL: 3600
   ```

3. **DNS 전파 대기** (10-60분)

4. **Resend에서 인증 확인**
   - Domains → 해당 도메인 클릭 → "Verify" 버튼

### 2.3 발신자 이메일 설정

테스트 발송용 이메일 주소:
```
no-reply@anders.kr
event@anders.kr
```

---

## 3️⃣ Vercel Production 환경 구성

### 3.1 프로젝트 생성 또는 연결

**Option A: Vercel Dashboard 사용**

1. https://vercel.com/new 접속
2. Git Repository 선택 (GitHub/GitLab/Bitbucket)
3. Project Name: `event-os-admin`
4. Framework Preset: `Next.js`
5. Root Directory: `./` (기본값)

**Option B: Vercel CLI 사용**

```bash
# Vercel CLI 설치 (미설치 시)
npm install -g vercel

# 프로젝트 연결
vercel link

# 프로젝트 이름 입력 시:
# → event-os-admin
```

### 3.2 Environment Variables 입력

Vercel Dashboard → Project → Settings → Environment Variables

**Production 환경에만 추가**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Application
NEXT_PUBLIC_BASE_URL=https://event-os-admin.vercel.app
EVENT_BASE_URL=https://event-os-admin.vercel.app

# Cron Secret (32자 이상 랜덤 문자열)
CRON_SECRET=your_secure_random_string_32chars_minimum
```

**CRON_SECRET 생성 방법**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL
openssl rand -hex 32

# 또는 온라인 도구
# https://passwordsgenerator.net/
```

**⚠️ 주의사항**:
- Environment를 **"Production"**으로 선택
- `SUPABASE_SERVICE_ROLE_KEY`와 `CRON_SECRET`은 절대 Preview/Development에 노출하지 마세요

### 3.3 Build & Server 설정

Vercel Dashboard → Project → Settings → General

```
Build & Development Settings:
  Framework Preset: Next.js
  Build Command: npm run build (또는 비워두기)
  Output Directory: .next (또는 비워두기)
  Install Command: npm install (또는 비워두기)

Node.js Version: 18.x (또는 20.x)

Functions:
  Max Duration: 10s (Free) / 60s (Pro)
```

---

## 4️⃣ Cron/Scheduler 설정

### 4.1 Vercel Cron 확인

`vercel.json` 파일이 이미 생성되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/mail/worker",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/mail/scheduler",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/message/worker",
      "schedule": "* * * * *"
    }
  ]
}
```

**Cron 일정**:
- `/api/mail/worker` — **1분마다** 실행 (이메일 발송 처리)
- `/api/mail/scheduler` — **5분마다** 실행 (자동화/Follow-up 평가)
- `/api/message/worker` — **1분마다** 실행 (SMS/카카오 발송 처리)

### 4.2 CRON_SECRET 인증 확인

모든 Worker/Scheduler 엔드포인트는 이미 `CRON_SECRET` 인증이 적용되어 있습니다.

Vercel Cron은 자동으로 `Authorization` 헤더 없이 호출하므로, 프로덕션에서는 다음 중 하나를 선택:

**Option A: Vercel Cron 전용 헤더 사용**

`app/api/mail/worker/route.ts` 등에서:
```typescript
// Vercel Cron은 특별한 헤더를 자동으로 추가
const isVercelCron = request.headers.get('x-vercel-cron') === '1';

if (cronSecret && !isVercelCron) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

**Option B: CRON_SECRET를 비워두기 (개발 환경에서만 보호)**

프로덕션에서는 Vercel Cron만 호출하므로, `CRON_SECRET`을 설정하지 않으면 모든 요청 허용.
외부 Cron 서비스 사용 시에만 `CRON_SECRET` 설정.

**권장**: Option B (Vercel Cron 사용 시)

---

## 5️⃣ Final Production Build

### 5.1 로컬에서 최종 빌드 테스트

```bash
# 환경 변수 설정 (.env.local에 Production 값 임시 입력)
# 또는 .env.production 파일 생성

npm run build
```

**확인사항**:
- ✅ `Compiled successfully` 메시지
- ✅ 에러 0개
- ⚠️ 경고 5개 (React Hook, `<img>` 태그 — 무시 가능)

### 5.2 Vercel 배포

**Option A: Git Push 배포 (권장)**

```bash
# 모든 변경사항 커밋
git add .
git commit -m "chore: production deployment preparation"
git push origin main

# Vercel이 자동으로 배포 시작
```

**Option B: Vercel CLI 배포**

```bash
# Production 배포
vercel --prod

# 배포 완료 후 URL 확인
# → https://event-os-admin.vercel.app
```

### 5.3 배포 로그 확인

Vercel Dashboard → Project → Deployments → 최신 배포 클릭

**확인사항**:
- ✅ Build Status: `Ready`
- ✅ Functions: 모든 API Routes 정상 배포
- ✅ Server Actions: 정상 배포
- ✅ Static Pages: 정상 빌드

---

## 6️⃣ Smoke Test (배포 후 5분 내 완성)

### 6.1 Admin 로그인
```
URL: https://event-os-admin.vercel.app/admin/login
```

- [ ] 로그인 페이지 로드
- [ ] Supabase 연결 확인

### 6.2 Participants
```
URL: /admin/events/[eventId]/participants
```

- [ ] 참가자 목록 로드
- [ ] 검색 기능 작동
- [ ] 필터 기능 작동
- [ ] Drawer 열기 및 상세 정보 확인
- [ ] 참가자 편집 기능

### 6.3 Tables
```
URL: /admin/events/[eventId]/tables
```

- [ ] 테이블 목록 로드
- [ ] Draft Assign 작동
- [ ] Confirm Assign 작동
- [ ] 드래그 앤 드롭 기능

### 6.4 Mail Center
```
URL: /admin/events/[eventId]/mail
```

- [ ] 템플릿 목록 로드
- [ ] **Template Create** — 새 템플릿 생성
- [ ] **Test Send** — 테스트 이메일 발송 (본인 이메일로)
- [ ] **Campaign Start** — 캠페인 시작 (소규모 세그먼트로 테스트)
- [ ] **Worker → Logs** — 발송 로그 확인

**⚠️ 중요**: 첫 캠페인은 **VIP Only** 또는 **자신의 이메일만** 세그먼트로 테스트!

### 6.5 Automations
```
URL: /admin/events/[eventId]/mail/automations
```

- [ ] Automation 생성
- [ ] Absolute Time 설정
- [ ] Relative Time 설정
- [ ] Segmentation 적용
- [ ] Activate/Deactivate 토글

### 6.6 Follow-up
```
URL: /admin/events/[eventId]/mail/followups
```

- [ ] Follow-up 생성
- [ ] `on_fail` 트리거
- [ ] `on_success` 트리거
- [ ] `after_hours` 트리거
- [ ] Delay 설정

### 6.7 A/B Test
```
URL: /admin/events/[eventId]/mail/ab-tests
```

- [ ] A/B Test 생성
- [ ] 2-3개 Variant 추가
- [ ] Weighted Assignment 설정
- [ ] Start Test
- [ ] Result Compare (발송 후)

### 6.8 Analytics
```
URL: /admin/events/[eventId]/mail/analytics
```

- [ ] 통계 카드 로드
- [ ] Segmentation Chart 렌더링
- [ ] Failure Reasons Chart 렌더링
- [ ] Time Series Chart 렌더링
- [ ] Job Performance Table 로드

### 6.9 Cron Jobs 확인

**5분 후 Vercel Dashboard 확인**:

Vercel Dashboard → Project → Functions → Logs

- [ ] `/api/mail/worker` — 1분마다 실행 중
- [ ] `/api/mail/scheduler` — 5분마다 실행 중
- [ ] `/api/message/worker` — 1분마다 실행 중
- [ ] 모든 Cron 작업 200 응답

---

## 7️⃣ Release v1.0 태그 생성

```bash
# Git tag 생성
git tag -a v1.0.0 -m "Event OS Admin Release v1.0.0 - Production Ready"

# Tag push
git push origin v1.0.0

# GitHub Release 생성 (GitHub 사용 시)
# → Releases → Draft a new release → Tag: v1.0.0
```

---

## 8️⃣ 배포 완료 확인

### Production URL
```
https://event-os-admin.vercel.app
```

### 체크리스트
- [ ] Supabase Production 연결 확인
- [ ] Resend Production API 작동 확인
- [ ] Vercel 배포 성공
- [ ] Cron Jobs 정상 실행
- [ ] Smoke Test 모두 통과
- [ ] Git Tag v1.0.0 생성
- [ ] 모니터링 설정 완료

---

## 🚨 트러블슈팅

### 문제 1: 빌드 실패
**원인**: 환경 변수 누락 또는 TypeScript 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# Vercel Environment Variables 재확인
# → Production 환경에만 설정되어 있는지 확인
```

### 문제 2: Supabase 연결 실패
**원인**: RLS 정책 또는 잘못된 API Key

**해결**:
```bash
# Supabase Dashboard → SQL Editor
# 테스트 쿼리 실행:
SELECT * FROM events LIMIT 1;

# RLS 정책 확인
# → Service Role Key 사용 시 RLS 우회됨
```

### 문제 3: Resend 이메일 발송 실패
**원인**: 도메인 미인증 또는 API Key 오류

**해결**:
1. Resend Dashboard → Domains → 도메인 인증 상태 확인
2. DNS 레코드 재확인 (SPF, DKIM, DMARC)
3. API Key 권한 확인 (Sending access)

### 문제 4: Cron Jobs 실행 안됨
**원인**: `vercel.json` 누락 또는 배포 후 미반영

**해결**:
```bash
# vercel.json 확인
cat vercel.json

# 재배포
vercel --prod

# Vercel Dashboard → Functions → Logs 확인
```

### 문제 5: CRON_SECRET 인증 오류
**원인**: Vercel Cron은 Authorization 헤더 없이 호출

**해결**:
```typescript
// API Route에서 Vercel Cron 예외 처리
const isVercelCron = request.headers.get('x-vercel-cron') === '1';
if (!isVercelCron) {
  // CRON_SECRET 검증
}
```

---

## 📊 배포 후 모니터링

### Vercel Analytics
- Vercel Dashboard → Project → Analytics
- Web Vitals 확인
- Error Rate 모니터링

### Supabase Monitoring
- Supabase Dashboard → Database → Query Performance
- API 사용량 확인
- Database 크기 모니터링

### Resend Dashboard
- 이메일 발송 성공률
- Bounce Rate
- Complaint Rate

---

## ✅ 배포 완료!

**Event OS Admin v1.0 — Production 배포 성공! 🎉**

다음 단계:
1. 실제 이벤트 생성 및 참가자 초대
2. 첫 캠페인 발송 (소규모 테스트)
3. Analytics 데이터 수집
4. 사용자 피드백 수집
5. Phase 2 기능 개발 시작

**문의사항**: 배포 중 문제 발생 시 `STEP_22_COMPLETION_REPORT.md` 참고

