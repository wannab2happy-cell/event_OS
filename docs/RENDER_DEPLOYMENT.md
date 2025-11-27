# Render.com 배포 가이드

## 1. 사전 준비

### 필수 요구사항

- Render.com 계정
- GitHub 리포지토리 연결
- 환경 변수 설정 준비

## 2. Render.com 프로젝트 생성

### 새 Web Service 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com

2. **"New +" 버튼 클릭 → "Web Service" 선택**

3. **GitHub 리포지토리 연결**
   - GitHub 리포지토리 선택
   - Branch: `main` (또는 배포할 브랜치)

4. **서비스 설정**
   - **Name**: `event-os` (또는 원하는 이름)
   - **Region**: 가장 가까운 지역 선택
   - **Branch**: `main`
   - **Root Directory**: (비워두기 - 루트 디렉토리 사용)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (기본값)

5. **빌드 및 실행 설정**
   - **Build Command**: (Dockerfile에서 처리)
   - **Start Command**: (Dockerfile에서 처리)

## 3. 환경 변수 설정

### Render.com 환경 변수 추가

1. **Settings → Environment Variables**

2. **필수 환경 변수 추가**

| 변수 이름 | 값 | 설명 |
|---------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Service Role Key |
| `RESEND_API_KEY` | `re_...` | Resend API Key |
| `RESEND_DOMAIN` | `resend.com` | Resend 도메인 (선택) |
| `NODE_ENV` | `production` | Node 환경 |

### 환경 변수 설정 방법

1. "Add Environment Variable" 클릭
2. Key와 Value 입력
3. "Save Changes" 클릭

## 4. 빌드 및 배포

### 자동 배포

- Git Push 시 자동으로 배포됩니다
- Render.com이 변경사항을 감지하고 자동 빌드 시작

### 수동 배포

1. **Dashboard → Manual Deploy**
2. **"Deploy latest commit"** 클릭

## 5. 배포 확인

### 배포 상태 확인

1. **Dashboard → Logs**
   - 빌드 로그 확인
   - 런타임 로그 확인
   - 에러가 없는지 확인

2. **배포된 URL 접속**
   - Render.com이 제공하는 URL로 접속
   - 예: `https://event-os.onrender.com`

### 확인 사항

- [ ] 빌드가 성공적으로 완료되었는지 확인
- [ ] 배포된 URL로 접속이 가능한지 확인
- [ ] 홈페이지가 정상적으로 로드되는지 확인
- [ ] 환경 변수가 정상적으로 로드되는지 확인

## 6. 커스텀 도메인 설정 (선택)

### 도메인 추가

1. **Settings → Custom Domains**
2. **"Add Custom Domain"** 클릭
3. 도메인 입력 및 DNS 설정 안내 따르기

## 7. 문제 해결

### 빌드 실패 시

1. **로그 확인**
   - Dashboard → Logs에서 빌드 에러 확인
   - Docker 빌드 에러 확인

2. **환경 변수 확인**
   - 모든 필수 환경 변수가 설정되었는지 확인
   - 변수 이름 오타 확인

3. **Dockerfile 확인**
   - Dockerfile이 올바른지 확인
   - next.config.ts의 `output: 'standalone'` 설정 확인

### 런타임 에러 시

1. **로그 확인**
   - Dashboard → Logs에서 런타임 에러 확인
   - 환경 변수 로드 에러 확인

2. **환경 변수 확인**
   - 서버 전용 키가 올바르게 설정되었는지 확인
   - Public 키가 올바르게 설정되었는지 확인

### 성능 최적화

1. **Auto-scaling 설정**
   - Settings → Auto-Deploy
   - 필요시 스케일링 설정

2. **Health Check 설정**
   - Settings → Health Check Path
   - `/api/health` 엔드포인트 추가 (선택)

## 8. Vercel vs Render.com 비교

| 항목 | Vercel | Render.com |
|------|--------|------------|
| 배포 속도 | 빠름 | 보통 |
| Next.js 지원 | 최적화됨 | Docker 필요 |
| 무료 티어 | 제한적 | 더 관대함 |
| 자동 배포 | ✅ | ✅ |
| 환경 변수 | ✅ | ✅ |
| 커스텀 도메인 | ✅ | ✅ |

## 9. 듀얼 배포 전략

### Vercel + Render.com 동시 사용

- **Vercel**: 프로덕션 환경 (주 배포)
- **Render.com**: 백업/테스트 환경

### 환경 변수 관리

- 각 플랫폼에서 동일한 환경 변수 설정
- 환경 변수 변경 시 두 플랫폼 모두 업데이트

## 10. 체크리스트

배포 전 확인:

- [ ] Dockerfile이 프로젝트 루트에 있음
- [ ] `.dockerignore` 파일이 있음
- [ ] `next.config.ts`에 `output: 'standalone'` 설정됨
- [ ] 모든 환경 변수가 Render.com에 설정됨
- [ ] GitHub 리포지토리가 연결됨
- [ ] 빌드가 성공적으로 완료됨
- [ ] 배포된 URL이 정상 작동함

