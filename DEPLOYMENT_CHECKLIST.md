# Event OS Admin — 배포 체크리스트

**프로덕션 배포 전 필수 점검 항목**

---

## 📋 1. 환경 변수 설정

### Supabase 설정
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**체크포인트:**
- [ ] Production Supabase 프로젝트 생성 완료
- [ ] Anon Key가 Public으로 노출되어도 안전함 (RLS 적용됨)
- [ ] Service Role Key는 **절대** 클라이언트에 노출되지 않음

---

### Resend API 설정
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**체크포인트:**
- [ ] Resend Production API Key 발급 완료
- [ ] 도메인 인증 완료 (SPF, DKIM, DMARC)
- [ ] 발신자 이메일 등록 완료 (`no-reply@yourdomain.com`)
- [ ] 테스트 이메일 발송 성공

---

### Application URL 설정
```bash
NEXT_PUBLIC_BASE_URL=https://event.yourdomain.com
EVENT_BASE_URL=https://event.yourdomain.com
```

**체크포인트:**
- [ ] 실제 배포 도메인으로 변경
- [ ] HTTPS 적용 확인
- [ ] `localhost:3000` 제거 확인

---

### Cron Secret 설정
```bash
CRON_SECRET=your_secure_random_string_here_32chars_min
```

**체크포인트:**
- [ ] 최소 32자 이상 랜덤 문자열 생성
- [ ] 외부에 노출되지 않도록 관리
- [ ] Vercel Cron 또는 외부 Cron 서비스에 동일한 값 설정

---

## 🗄️ 2. Supabase 데이터베이스 설정

### 필수 테이블 생성
- [ ] `events` — 이벤트 메타데이터
- [ ] `event_participants` — 참가자 정보
- [ ] `email_templates` — 이메일 템플릿
- [ ] `email_jobs` — 이메일 발송 작업
- [ ] `email_logs` — 이메일 발송 로그
- [ ] `email_automations` — 자동화 규칙
- [ ] `email_followups` — Follow-up 캠페인
- [ ] `email_ab_tests` — A/B 테스트
- [ ] `email_ab_assignments` — A/B 테스트 참가자 할당
- [ ] `message_templates` — SMS/카카오 템플릿
- [ ] `message_jobs` — SMS/카카오 발송 작업
- [ ] `message_logs` — SMS/카카오 발송 로그

### RLS (Row Level Security) 정책
- [ ] `event_participants` 테이블: Admin만 읽기/쓰기 가능
- [ ] `email_templates` 테이블: Admin만 읽기/쓰기 가능
- [ ] `email_jobs` 테이블: Admin만 읽기/쓰기 가능
- [ ] `email_logs` 테이블: Admin만 읽기 가능
- [ ] 모든 테이블에 적절한 RLS 정책 적용

### 인덱스 생성 (성능 최적화)
```sql
-- event_participants 인덱스
CREATE INDEX idx_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_participants_email ON event_participants(email);
CREATE INDEX idx_participants_company ON event_participants(company);
CREATE INDEX idx_participants_status ON event_participants(status);

-- email_jobs 인덱스
CREATE INDEX idx_email_jobs_event_id ON email_jobs(event_id);
CREATE INDEX idx_email_jobs_status ON email_jobs(status);
CREATE INDEX idx_email_jobs_created_at ON email_jobs(created_at DESC);

-- email_logs 인덱스
CREATE INDEX idx_email_logs_job_id ON email_logs(job_id);
CREATE INDEX idx_email_logs_participant_id ON email_logs(participant_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

**체크포인트:**
- [ ] 모든 인덱스 생성 완료
- [ ] 쿼리 성능 테스트 완료 (1,000+ 참가자 기준)

---

## 📧 3. Resend 도메인 인증

### DNS 레코드 설정
1. **SPF 레코드** (TXT)
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

2. **DKIM 레코드** (TXT)
   ```
   resend._domainkey.yourdomain.com → [Resend 제공 값]
   ```

3. **DMARC 레코드** (TXT)
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

**체크포인트:**
- [ ] 모든 DNS 레코드 추가 완료
- [ ] Resend 대시보드에서 인증 확인 완료
- [ ] 테스트 이메일 발송 성공

---

## ⏰ 4. Cron 작업 설정

### Vercel Cron 사용 시
`vercel.json` 생성:
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
    }
  ]
}
```

### 외부 Cron 서비스 사용 시 (예: EasyCron, cron-job.org)
1. **Worker 엔드포인트**
   - URL: `https://event.yourdomain.com/api/mail/worker`
   - 주기: 1분마다
   - 헤더: `Authorization: Bearer ${CRON_SECRET}`

2. **Scheduler 엔드포인트**
   - URL: `https://event.yourdomain.com/api/mail/scheduler`
   - 주기: 5분마다
   - 헤더: `Authorization: Bearer ${CRON_SECRET}`

**체크포인트:**
- [ ] Worker 엔드포인트 정상 작동 확인
- [ ] Scheduler 엔드포인트 정상 작동 확인
- [ ] CRON_SECRET 헤더 인증 확인
- [ ] 로그 모니터링 설정

---

## 🔒 5. 보안 점검

### API Route 보호
- [ ] `/api/mail/worker` — CRON_SECRET 인증 적용
- [ ] `/api/mail/scheduler` — CRON_SECRET 인증 적용
- [ ] 모든 Server Actions — 서버 단에서만 실행
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — 서버 단에서만 사용

### CORS 설정
- [ ] Supabase CORS 설정: 프로덕션 도메인만 허용
- [ ] Next.js CORS 설정: 필요 시 `next.config.js` 수정

### Rate Limiting
- [ ] Resend API Rate Limit 확인 (무료 플랜: 100/day)
- [ ] Worker Rate Limiting: 150ms/email
- [ ] Supabase API Limit 확인

---

## 🚀 6. 배포 (Vercel)

### Vercel 프로젝트 설정
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 연결
vercel link

# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_BASE_URL
vercel env add EVENT_BASE_URL
vercel env add CRON_SECRET

# 배포
vercel --prod
```

**체크포인트:**
- [ ] Vercel 프로젝트 생성 완료
- [ ] 모든 환경 변수 추가 완료
- [ ] 빌드 성공 확인
- [ ] 배포 URL 확인

---

## 🧪 7. 배포 후 테스트

### 기능 테스트
- [ ] Admin 로그인 정상 작동
- [ ] 참가자 목록 로드 정상
- [ ] 이메일 템플릿 생성 정상
- [ ] 테스트 이메일 발송 성공
- [ ] 캠페인 발송 정상 작동
- [ ] Worker 자동 실행 확인
- [ ] Scheduler 자동 실행 확인
- [ ] Analytics 차트 렌더링 정상

### 성능 테스트
- [ ] 1,000+ 참가자 로드 시간 < 2초
- [ ] 대량 이메일 발송 안정성 확인 (100+ 이메일)
- [ ] Chart 렌더링 60fps 유지

### 크로스 브라우저 테스트
- [ ] Chrome — 모든 기능 정상
- [ ] Safari — 모든 기능 정상
- [ ] Edge — 모든 기능 정상
- [ ] Mobile (iOS Safari) — 반응형 레이아웃 정상
- [ ] Mobile (Android Chrome) — 반응형 레이아웃 정상

---

## 📊 8. 모니터링 설정

### Vercel Analytics
- [ ] Vercel Analytics 활성화
- [ ] Web Vitals 모니터링
- [ ] Error Tracking 설정

### Supabase Monitoring
- [ ] Supabase Dashboard 모니터링 설정
- [ ] Database 성능 모니터링
- [ ] API 사용량 모니터링

### Resend Monitoring
- [ ] Resend Dashboard 모니터링
- [ ] 이메일 발송 성공률 추적
- [ ] Bounce/Complaint Rate 모니터링

---

## ✅ 최종 점검

- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 데이터베이스 및 RLS 설정 완료
- [ ] Resend 도메인 인증 완료
- [ ] Cron 작업 정상 작동 확인
- [ ] 보안 점검 완료
- [ ] Vercel 배포 완료
- [ ] 배포 후 기능 테스트 완료
- [ ] 모니터링 설정 완료

---

**배포 준비 완료! 🎉**

문제 발생 시:
1. Vercel Logs 확인
2. Supabase Logs 확인
3. Resend Dashboard 확인
4. Browser DevTools Console 확인




