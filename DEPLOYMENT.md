# Event OS 배포 가이드

## 1. ⚙️ Vercel 환경 변수 설정

Admin 기능과 메일 발송 로직은 서버 측에서만 접근해야 하는 민감한 키를 사용합니다. Vercel 대시보드에 다음 6가지 키를 정확히 입력해야 합니다.

### 필수 환경 변수 체크리스트

| # | 변수 이름 | 사용 용도 | 노출 범위 | 필수 여부 | 확인 |
|---|---------|---------|---------|---------|------|
| 1 | `SUPABASE_SERVICE_ROLE_KEY` | Admin 대시보드에서 RLS를 우회하여 모든 참가자 데이터 조회 및 수정 | ✅ 서버 전용 | 필수 | ☐ |
| 2 | `RESEND_API_KEY` | 확정 메일 및 Magic Link 발송 | ✅ 서버 전용 | 필수 | ☐ |
| 3 | `RESEND_DOMAIN` | Resend API 사용 시 발신 도메인 | ✅ 서버 전용 | 선택* | ☐ |
| 4 | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 🌎 Public | 필수 | ☐ |
| 5 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Key | 🌎 Public | 필수 | ☐ |
| 7 | `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL (이메일 링크용) | 🌎 Public | 필수 | ☐ |

\* `RESEND_DOMAIN`이 없으면 기본 도메인(`onboarding@resend.dev`) 사용  

### 환경 변수 값 확인 방법

#### Supabase 값 확인
1. Supabase 대시보드 → Project Settings → API
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 노출 금지)

#### Resend 값 확인
1. Resend 대시보드 → API Keys
   - API Key 생성 → `RESEND_API_KEY`
2. Resend 대시보드 → Domains
   - 도메인 추가 후 → `RESEND_DOMAIN` (예: `resend.com`)

#### Site URL 설정
- Production: `https://events.anders.kr` (커스텀 도메인)
- 또는 Vercel 기본 도메인: `https://[your-vercel-domain].vercel.app`


### ⚠️ 중요 보안 주의사항

- `NEXT_PUBLIC_` 접두사가 **없는** 키들은 절대 클라이언트 코드나 Vercel의 Public 환경 변수에 노출되어서는 안 됩니다.
- 서버 전용 키들은 **반드시** Production, Preview, Development 환경 모두에 설정해야 합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회하므로 절대 클라이언트에 노출되면 안 됩니다.

### Vercel 환경 변수 설정 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com/anders-projects-2d7c87b2/event-os/settings/environment-variables
   - 또는: 프로젝트 → Settings → Environment Variables

2. **각 환경 변수 추가**
   - "Add New" 버튼 클릭
   - Key: 환경 변수 이름 (위 표 참고)
   - Value: 실제 값
   - Environment: **Production, Preview, Development 모두 선택** ✅

3. **설정 확인**
   - 모든 환경 변수가 3개 환경 모두에 설정되었는지 확인
   - 변수 이름 오타 확인
   - 값이 올바르게 입력되었는지 확인

### 환경 변수 설정 확인 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production, Preview, Development 모두 설정됨
- [ ] `RESEND_API_KEY` - Production, Preview, Development 모두 설정됨
- [ ] `RESEND_DOMAIN` - Production, Preview, Development 모두 설정됨 (또는 기본값 사용)
- [ ] `SLACK_ADMIN_WEBHOOK` - Production, Preview, Development 모두 설정됨 (또는 선택사항)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production, Preview, Development 모두 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production, Preview, Development 모두 설정됨
- [ ] `NEXT_PUBLIC_SITE_URL` - Production: `https://events.anders.kr` 설정됨
- [ ] 모든 서버 전용 키가 Public 환경 변수로 설정되지 않았는지 확인
- [ ] 배포 후 환경 변수가 정상적으로 로드되는지 확인
- [ ] Supabase Redirect URL에 `https://events.anders.kr/**` 추가됨

## 2. 📝 배포 최적화 설정

`vercel.json` 파일이 프로젝트 루트에 생성되어 있습니다. 이 설정은:
- 정적 애셋(CSS, 이미지)의 캐싱을 극대화하여 로딩 속도 개선
- 보안 헤더 설정 (HSTS, X-Frame-Options 등)
- 서버리스 함수의 빌드 설정 명확화

## 3. 🚀 배포 전 최종 체크리스트

### ✅ DB RLS 최종 확인

1. Supabase 대시보드에서 `event_participants` 테이블 확인
2. RLS (Row Level Security)가 활성화되어 있는지 확인
3. `auth_id` 컬럼이 있는지 확인 (필요한 경우)

### ✅ Supabase Redirect URL 설정

1. Supabase 대시보드 → Authentication → URL Configuration
2. 배포된 도메인을 Redirect URL로 추가:
   - Production: `https://[Your-Domain].vercel.app`
   - Preview: `https://[Preview-Domain].vercel.app`
3. 로그인 후 리다이렉트 오류 방지

### ✅ Storage 버킷 접근성

1. Supabase 대시보드 → Storage
2. `event_assets` 버킷이 Public으로 설정되어 있는지 확인
3. 브랜딩 이미지 로딩 오류 방지

### ✅ Next.js 빌드 테스트

로컬에서 빌드 테스트 실행:
```bash
npm run build
```

컴파일 오류가 없는지 확인합니다.

## 4. 🚀 배포 방법

### 자동 배포 (Git Push)

1. 변경사항 커밋:
   ```bash
   git add .
   git commit -m "feat: 배포 설정 완료"
   git push origin main
   ```

2. Vercel이 자동으로 배포를 감지하고 빌드 시작

### 수동 배포 (Vercel CLI)

```bash
vercel --prod --token $VERCEL_TOKEN
```

## 5. 🔍 배포 후 확인 사항

1. **홈페이지 접속**: 배포된 URL로 접속하여 정상 작동 확인
2. **로그인 테스트**: Admin 로그인 및 참가자 로그인 테스트
3. **메일 발송 테스트**: 확정 메일 발송 기능 테스트
4. **에러 모니터링**: Vercel 대시보드에서 빌드 및 런타임 에러 확인

## 6. 🛠️ 문제 해결

### 빌드 실패 시

1. Vercel 빌드 로그 확인
2. 환경 변수 누락 확인
3. 로컬에서 `npm run build` 실행하여 오류 확인

### 환경 변수 오류 시

1. Vercel 대시보드에서 환경 변수 재확인
2. 서버 전용 키가 Public으로 노출되지 않았는지 확인
3. 환경 변수 이름 오타 확인

### Supabase 연결 오류 시

1. `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
2. Supabase 프로젝트 상태 확인
3. 네트워크 방화벽 설정 확인

