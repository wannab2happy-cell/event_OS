# Step 23 — Production Deployment 가이드

**완료 상태**: 📋 **배포 준비 완료 (사용자 실행 대기)**

---

## ⚠️ 중요 안내

Step 23은 실제 프로덕션 배포 단계로, **사용자의 계정 및 권한이 필요**한 작업들입니다.

AI가 직접 수행할 수 없는 작업:
- ❌ Supabase Production 프로젝트 생성
- ❌ Resend Production API Key 발급
- ❌ Vercel 계정 연결 및 배포
- ❌ DNS 레코드 설정
- ❌ Git push 및 tag 생성

AI가 완료한 작업:
- ✅ 배포 가이드 문서 생성 (`PRODUCTION_DEPLOYMENT_GUIDE.md`)
- ✅ 배포 체크리스트 생성 (`DEPLOYMENT_CHECKLIST.md`)
- ✅ 배포 전 검증 스크립트 생성 (`scripts/deploy-check.sh`)
- ✅ Vercel Cron 설정 파일 생성 (`vercel.json`)
- ✅ 환경 변수 템플릿 생성 (`.env.example` - blocked by gitignore)
- ✅ Release Notes 생성 (`RELEASE_NOTES.md`)

---

## 📋 사용자가 수행할 배포 단계

### 1단계: Git 변경사항 커밋

**현재 상태**: 많은 파일이 수정/추가됨

```bash
# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: Event OS Admin v1.0 - Production Ready

- Complete Mail Center implementation
- Segmentation Engine
- Email Job Worker
- Automation & Follow-up
- A/B Testing Engine
- Campaign Analytics
- Cross-browser stability
- Production deployment preparation
- CRON_SECRET protection for API routes
- Release documentation

Closes #1"

# Push (GitHub/GitLab/Bitbucket)
git push origin main
```

### 2단계: Supabase Production 프로젝트 생성

1. **Supabase Dashboard 접속**: https://app.supabase.com
2. **New Project 클릭**
3. **프로젝트 설정**:
   - Project Name: `event-os-prod`
   - Database Password: [안전한 비밀번호]
   - Region: `ap-northeast-2` (Tokyo)
4. **프로젝트 생성 대기** (2-3분)

### 3단계: 데이터베이스 스키마 마이그레이션

Supabase Dashboard → SQL Editor → New Query

`PRODUCTION_DEPLOYMENT_GUIDE.md` 파일의 SQL 스크립트 전체 복사하여 실행

**포함 내용**:
- 12개 테이블 생성
- 인덱스 생성
- RLS 활성화

### 4단계: Supabase Keys 확보

Supabase Dashboard → Settings → API

아래 3개 복사:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (절대 노출 금지!)
```

### 5단계: Resend Production 설정

1. **Resend Dashboard 접속**: https://resend.com/dashboard
2. **API Key 생성**:
   - Name: `event-os-prod`
   - Permission: `Sending access`
3. **API Key 복사**:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```

### 6단계: 도메인 인증 (Resend)

**도메인 선택**: `anders.kr` 또는 `mail.anders.kr`

1. Resend Dashboard → Domains → Add Domain
2. DNS 레코드 추가 (도메인 제공업체):
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: [Resend 제공 값]
   - **DMARC**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@anders.kr`
3. DNS 전파 대기 (10-60분)
4. Resend에서 인증 확인

### 7단계: CRON_SECRET 생성

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL
openssl rand -hex 32

# 생성된 값 복사 (예: a1b2c3d4e5f6...)
```

### 8단계: Vercel 프로젝트 연결

**Option A: Vercel Dashboard**

1. https://vercel.com/new 접속
2. Git Repository 선택
3. Project Name: `event-os-admin`
4. Framework: `Next.js`

**Option B: Vercel CLI**

```bash
# CLI 설치 (미설치 시)
npm install -g vercel

# 프로젝트 연결
vercel link
```

### 9단계: Vercel Environment Variables 설정

Vercel Dashboard → Project → Settings → Environment Variables

**Production 환경에만** 아래 6개 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=[4단계에서 복사한 값]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[4단계에서 복사한 값]
SUPABASE_SERVICE_ROLE_KEY=[4단계에서 복사한 값]
RESEND_API_KEY=[5단계에서 복사한 값]
NEXT_PUBLIC_BASE_URL=https://event-os-admin.vercel.app
EVENT_BASE_URL=https://event-os-admin.vercel.app
CRON_SECRET=[7단계에서 생성한 값]
```

**⚠️ 중요**: Environment를 **"Production"**으로 선택!

### 10단계: Vercel 배포

**Option A: Git Push (자동 배포)**

```bash
# 이미 1단계에서 push 했다면 자동으로 배포 시작
# Vercel Dashboard에서 배포 상태 확인
```

**Option B: CLI 배포**

```bash
vercel --prod
```

**배포 완료 후 URL**: `https://event-os-admin.vercel.app`

### 11단계: Smoke Test (5분)

배포된 URL로 접속하여 테스트:

- [ ] Admin 로그인
- [ ] Participants 목록 로드
- [ ] Mail Center → Template Create
- [ ] Mail Center → Test Send (본인 이메일로)
- [ ] Mail Center → Campaign Start (VIP Only 세그먼트로)
- [ ] Worker Logs 확인
- [ ] Analytics 차트 렌더링
- [ ] Cron Jobs 실행 확인 (Vercel Dashboard → Functions → Logs)

### 12단계: Git Tag 생성

```bash
# Tag 생성
git tag -a v1.0.0 -m "Event OS Admin Release v1.0.0 - Production Ready"

# Tag push
git push origin v1.0.0

# GitHub Release 생성 (GitHub 사용 시)
# Releases → Draft a new release → Tag: v1.0.0
```

---

## 🛠️ 배포 전 자동 검증 (선택사항)

Windows에서는 WSL 또는 Git Bash 필요:

```bash
# 스크립트 실행 권한 부여 (Linux/Mac)
chmod +x scripts/deploy-check.sh

# 검증 실행
./scripts/deploy-check.sh
```

**검증 항목**:
- Git 상태
- 빌드 설정
- 환경 변수 템플릿
- API Routes
- Documentation
- Build Test

---

## 📚 참고 문서

| 문서 | 설명 |
|------|------|
| `PRODUCTION_DEPLOYMENT_GUIDE.md` | 상세 배포 가이드 (전체 SQL 포함) |
| `DEPLOYMENT_CHECKLIST.md` | 체크리스트 형식 가이드 |
| `RELEASE_NOTES.md` | Release v1.0 기능 및 변경사항 |
| `STEP_22_COMPLETION_REPORT.md` | Step 22 완료 리포트 |

---

## 🚨 트러블슈팅

### 문제: 빌드 실패
**해결**: 
```bash
npm run build
# 에러 메시지 확인 후 수정
```

### 문제: Supabase 연결 실패
**해결**: 
- Supabase Dashboard → SQL Editor에서 테스트 쿼리 실행
- RLS 정책 확인
- API Keys 재확인

### 문제: Resend 발송 실패
**해결**: 
- 도메인 인증 상태 확인 (Resend Dashboard)
- DNS 레코드 재확인
- API Key 권한 확인

### 문제: Cron Jobs 실행 안됨
**해결**: 
- `vercel.json` 파일 확인
- 재배포: `vercel --prod`
- Vercel Dashboard → Functions → Logs 확인

---

## ✅ Step 23 완료 기준

- [ ] Git 커밋 및 Push 완료
- [ ] Supabase Production 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 마이그레이션 완료
- [ ] Resend Production API 설정 완료
- [ ] 도메인 인증 완료
- [ ] Vercel Environment Variables 설정 완료
- [ ] Vercel 배포 성공
- [ ] Smoke Test 통과
- [ ] Cron Jobs 정상 실행 확인
- [ ] Git Tag v1.0.0 생성 완료

---

## 🎉 배포 완료!

**Event OS Admin v1.0 — Production 배포 성공!**

다음 단계:
1. 실제 이벤트 생성
2. 참가자 초대 및 관리
3. 첫 캠페인 발송 (소규모 테스트)
4. Analytics 데이터 수집
5. 사용자 피드백 수집
6. Phase 2 기능 개발 시작

---

**배포 중 문제 발생 시**: 위 트러블슈팅 섹션 참고 또는 `PRODUCTION_DEPLOYMENT_GUIDE.md` 확인




