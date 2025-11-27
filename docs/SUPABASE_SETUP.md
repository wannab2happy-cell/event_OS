# Supabase 설정 가이드

## 1. Storage 버킷 설정

### event_assets 버킷 생성 및 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Storage 메뉴로 이동**
   - 왼쪽 메뉴에서 "Storage" 클릭

3. **새 버킷 생성**
   - "New bucket" 버튼 클릭
   - 버킷 이름: `event_assets`
   - Public bucket: ✅ **체크 (Public으로 설정)**
   - File size limit: 5MB (권장)
   - Allowed MIME types: `image/*` (이미지 파일만 허용)

4. **버킷 정책 설정**
   - Storage → Policies → `event_assets`
   - 다음 정책 추가:

```sql
-- 모든 사용자가 파일 조회 가능 (Public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event_assets');

-- Admin만 파일 업로드 가능 (Service Role Key 사용)
-- 참고: Admin 기능은 Service Role Key로 업로드하므로 별도 정책 불필요
```

### 확인 사항

- ✅ 버킷 이름이 정확히 `event_assets`인지 확인
- ✅ Public bucket 옵션이 활성화되어 있는지 확인
- ✅ 브랜딩 이미지(로고, KV 이미지)가 정상적으로 로드되는지 확인

## 2. Redirect URL 설정

### Authentication 설정

1. **Supabase 대시보드 접속**
   - Authentication → URL Configuration

2. **Site URL 설정**
   - Production: `https://events.anders.kr` (커스텀 도메인)
   - 또는 Vercel 기본 도메인: `https://[your-vercel-domain].vercel.app`

3. **Redirect URLs 추가**
   다음 URL들을 추가하세요:

```
# Production (커스텀 도메인)
https://events.anders.kr/**
https://events.anders.kr/admin/**
https://events.anders.kr/*/register
https://events.anders.kr/*/qr-pass

# Production (Vercel 기본 도메인 - 백업용)
https://[your-vercel-domain].vercel.app/**
https://[your-vercel-domain].vercel.app/admin/**
https://[your-vercel-domain].vercel.app/*/register
https://[your-vercel-domain].vercel.app/*/qr-pass

# Preview (Vercel Preview 배포용)
https://[preview-branch]-[project].vercel.app/**

# Local Development
http://localhost:3000/**
```

### 확인 사항

- ✅ 로그인 후 리다이렉트 오류가 발생하지 않는지 확인
- ✅ Magic Link 로그인이 정상 작동하는지 확인
- ✅ Admin 로그인이 정상 작동하는지 확인

## 3. RLS 정책 설정

### 보안 SQL 실행

1. **Supabase 대시보드 접속**
   - SQL Editor 메뉴로 이동

2. **보안 설정 SQL 실행**
   - 프로젝트 루트의 `supabase/security_setup.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

3. **정책 확인**
   - Table Editor → `event_participants` 테이블
   - "Policies" 탭에서 정책이 생성되었는지 확인

### 확인 사항

- ✅ `event_participants` 테이블에 RLS가 활성화되어 있는지 확인
- ✅ 참가자가 자신의 데이터만 조회/수정 가능한지 테스트
- ✅ Admin이 모든 데이터에 접근 가능한지 확인

## 4. 환경 변수 확인

### Supabase 프로젝트 정보

1. **Project Settings → API**
   - `Project URL`: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - `anon public` key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - `service_role` key: `SUPABASE_SERVICE_ROLE_KEY`에 사용 (서버 전용)

### 확인 사항

- ✅ 모든 환경 변수가 Vercel에 설정되어 있는지 확인
- ✅ Service Role Key가 클라이언트에 노출되지 않았는지 확인

