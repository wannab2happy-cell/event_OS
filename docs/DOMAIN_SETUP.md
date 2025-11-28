# 도메인 설정 가이드

## 도메인 정보

- **커스텀 도메인**: `events.anders.kr`
- **DNS 설정**: CNAME 레코드로 Vercel에 연결 완료

## 1. Vercel 도메인 설정 확인

### 도메인 연결 상태 확인

1. **Vercel 대시보드 접속**
   - 프로젝트 → Settings → Domains

2. **도메인 확인**
   - `events.anders.kr` 도메인이 추가되어 있는지 확인
   - SSL 인증서 상태 확인 (자동 발급)

3. **DNS 설정 확인**
   - CNAME 레코드가 올바르게 설정되었는지 확인
   - DNS 전파 완료 확인 (최대 24시간 소요)

## 2. 환경 변수 설정

### NEXT_PUBLIC_SITE_URL 설정

Vercel 환경 변수에 다음을 추가하세요:

- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: `https://events.anders.kr`
- **Environment**: Production, Preview, Development 모두 선택

### 설정 위치

1. **Vercel 대시보드**
   - Settings → Environment Variables
   - "Add New" 클릭
   - 위 정보 입력 후 저장

### 용도

이 환경 변수는 다음 용도로 사용됩니다:

- 이메일 링크 생성 (확정 메일의 QR PASS 링크)
- 절대 URL 생성
- 리다이렉트 URL 생성

## 3. Supabase Redirect URL 설정

### Authentication 설정 업데이트

1. **Supabase 대시보드 접속**
   - Authentication → URL Configuration

2. **Site URL 업데이트**
   - Site URL: `https://events.anders.kr`

3. **Redirect URLs 추가**
   다음 URL들을 추가하세요:

```
https://events.anders.kr/**
https://events.anders.kr/admin/**
https://events.anders.kr/*/register
https://events.anders.kr/*/qr-pass
```

### 확인 사항

- ✅ Site URL이 `https://events.anders.kr`로 설정됨
- ✅ Redirect URLs에 모든 경로 패턴이 추가됨
- ✅ 로그인 후 리다이렉트 오류가 발생하지 않음

## 4. 도메인 테스트

### 기본 접속 테스트

1. **홈페이지 접속**
   - `https://events.anders.kr` 접속
   - 페이지가 정상적으로 로드되는지 확인

2. **SSL 인증서 확인**
   - 브라우저 주소창에 자물쇠 아이콘 표시 확인
   - HTTPS 연결 확인

3. **이벤트 페이지 접속**
   - `https://events.anders.kr/[eventId]` 접속
   - 이벤트 정보가 정상적으로 표시되는지 확인

### 기능 테스트

1. **로그인 테스트**
   - Admin 로그인: `https://events.anders.kr/admin/login`
   - 참가자 로그인: Magic Link 사용
   - 로그인 후 리다이렉트 정상 작동 확인

2. **이메일 링크 테스트**
   - 확정 메일의 링크가 `https://events.anders.kr`로 시작하는지 확인
   - 링크 클릭 시 정상적으로 페이지 이동 확인

## 5. DNS 설정 확인

### CNAME 레코드 확인

도메인 등록 업체에서 다음 CNAME 레코드가 설정되어 있는지 확인:

- **Type**: CNAME
- **Name**: `events` (또는 `@` 서브도메인)
- **Value**: `cname.vercel-dns.com` (또는 Vercel이 제공한 값)
- **TTL**: 3600 (또는 기본값)

### DNS 전파 확인

1. **온라인 도구 사용**
   - https://dnschecker.org
   - `events.anders.kr` 입력
   - 전 세계 DNS 서버에서 전파 상태 확인

2. **로컬 확인**
   ```bash
   # Windows
   nslookup events.anders.kr
   
   # Mac/Linux
   dig events.anders.kr
   ```

## 6. 문제 해결

### 도메인이 연결되지 않아요

1. **DNS 설정 확인**
   - CNAME 레코드가 올바르게 설정되었는지 확인
   - DNS 전파 완료 대기 (최대 24시간)

2. **Vercel 설정 확인**
   - Vercel 대시보드에서 도메인이 추가되었는지 확인
   - SSL 인증서 발급 상태 확인

3. **브라우저 캐시 삭제**
   - 브라우저 캐시 및 DNS 캐시 삭제
   - 시크릿 모드에서 접속 시도

### SSL 인증서 오류

1. **인증서 발급 대기**
   - Vercel이 자동으로 SSL 인증서 발급 (최대 24시간)
   - 발급 완료까지 대기

2. **Vercel 로그 확인**
   - Vercel 대시보드 → Domains
   - SSL 인증서 상태 확인

### 리다이렉트 오류

1. **Supabase 설정 확인**
   - Redirect URLs에 `https://events.anders.kr/**` 추가 확인
   - Site URL이 올바르게 설정되었는지 확인

2. **환경 변수 확인**
   - `NEXT_PUBLIC_SITE_URL`이 `https://events.anders.kr`로 설정되었는지 확인

## 7. 체크리스트

도메인 설정 완료 확인:

- [ ] DNS CNAME 레코드 설정 완료
- [ ] Vercel에 도메인 추가 완료
- [ ] SSL 인증서 발급 완료
- [ ] `NEXT_PUBLIC_SITE_URL` 환경 변수 설정 완료
- [ ] Supabase Site URL 업데이트 완료
- [ ] Supabase Redirect URLs 추가 완료
- [ ] 도메인 접속 테스트 완료
- [ ] 로그인 기능 테스트 완료
- [ ] 이메일 링크 테스트 완료


