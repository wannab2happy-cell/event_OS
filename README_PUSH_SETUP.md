# Push 알림 시스템 설정 가이드

## 1. VAPID 키 생성

Web Push를 사용하기 위해서는 VAPID (Voluntary Application Server Identification) 키가 필요합니다.

### 키 생성 방법

```bash
npm install -g web-push
web-push generate-vapid-keys
```

출력 예시:
```
Public Key: BKx... (긴 문자열)
Private Key: ... (긴 문자열)
```

### 환경 변수 설정

`.env.local` 파일에 다음을 추가:

```env
# VAPID Keys (Web Push용)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

## 2. web-push 패키지 설치

```bash
npm install web-push
```

## 3. Service Worker 등록 확인

Service Worker 파일은 `public/sw.js`에 위치하며, Next.js가 자동으로 정적 파일로 제공합니다.

## 4. 테스트 방법

### 1) 참가자 페이지에서 구독 확인
- 참가자가 `/[eventId]/qr-pass` 페이지에 접속하면 자동으로 Push 구독이 시작됩니다.
- 브라우저에서 알림 권한을 허용해야 합니다.

### 2) Supabase에서 구독 확인
```sql
SELECT * FROM push_subscriptions WHERE event_id = 'your-event-id';
```

### 3) 관리자 페이지에서 Push 발송
- `/admin/events/[eventId]/broadcast` 접속
- 제목과 본문 입력
- "Push 알림 발송하기" 클릭

### 4) 알림 수신 확인
- 구독한 브라우저에서 알림이 도착하는지 확인
- 알림 클릭 시 QR Pass 페이지로 이동하는지 확인

## 5. 브라우저 지원

- ✅ Chrome (데스크탑 & 모바일)
- ✅ Edge (데스크탑 & 모바일)
- ✅ Firefox (데스크탑)
- ✅ Safari (macOS 16.4+, iOS 16.4+)
- ❌ Safari (이전 버전)

## 6. 문제 해결

### 구독이 생성되지 않는 경우
1. VAPID 키가 올바르게 설정되었는지 확인
2. 브라우저에서 알림 권한이 허용되었는지 확인
3. HTTPS 연결인지 확인 (localhost는 예외)
4. Service Worker가 정상적으로 등록되었는지 확인 (브라우저 개발자 도구 > Application > Service Workers)

### Push 알림이 발송되지 않는 경우
1. `web-push` 패키지가 설치되었는지 확인
2. VAPID 키가 올바르게 설정되었는지 확인
3. 구독 정보가 Supabase에 저장되었는지 확인
4. 서버 로그에서 에러 메시지 확인

### 알림이 도착하지 않는 경우
1. 브라우저에서 알림 권한이 허용되었는지 확인
2. 브라우저가 Push 알림을 지원하는지 확인
3. 네트워크 연결 상태 확인
4. Service Worker가 활성 상태인지 확인

## 7. 향후 확장 기능

- 조건부 타겟팅 (VIP만, 특정 상태만 등)
- 세션 시작 알림 자동화
- 리마인더 자동화
- 알림 템플릿 시스템

