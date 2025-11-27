# Anders Event Operating System

이벤트 참가자 관리 시스템 - Supabase, Resend, Next.js 기반의 무료 티어 최적화 솔루션

## 📋 프로젝트 개요

Anders Event Operating System은 이벤트 참가자 등록, 관리, 체크인을 위한 종합 관리 시스템입니다.

### 주요 기능

- ✅ 참가자 등록 (기본 정보, 여권, 항공, 호텔)
- ✅ Admin 대시보드 (참가자 관리, 통계)
- ✅ QR PASS (현장 체크인용)
- ✅ 확정 메일 자동 발송 (React Email 기반)
- ✅ 이벤트 브랜딩 설정
- ✅ 보안 (RLS 정책, 멀티테넌트 구조)

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Supabase 계정
- Resend 계정 (이메일 발송용)
- Vercel 계정 (배포용)

### 설치

```bash
# 리포지토리 클론
git clone https://github.com/wannab2happy-cell/event_OS.git

# 디렉토리 이동
cd event_OS

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 환경 변수 입력

# 개발 서버 실행
npm run dev
```

### 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_DOMAIN=your_resend_domain

# Site URL
NEXT_PUBLIC_SITE_URL=https://events.anders.kr
# Local Development: http://localhost:3000
```

## 📚 문서

### 설정 가이드

- [Supabase 설정 가이드](./docs/SUPABASE_SETUP.md) - Supabase DB, Storage, Authentication 설정
- [배포 가이드](./DEPLOYMENT.md) - Vercel 배포 가이드
- [Render.com 배포 가이드](./docs/RENDER_DEPLOYMENT.md) - Render.com 배포 가이드

### 보안 설정

- [보안 설정 SQL](./supabase/security_setup.sql) - RLS 정책, get_claim 함수

### 사용 가이드

- [Admin 사용 가이드](./docs/ADMIN_GUIDE.md) - Admin 기능 사용법
- [참가자 등록 가이드](./docs/PARTICIPANT_GUIDE.md) - 참가자 등록 절차

### 테스트

- [테스트 체크리스트](./docs/TESTING_CHECKLIST.md) - 배포 후 테스트 항목

## 🏗️ 프로젝트 구조

```
event_OS/
├── app/                    # Next.js App Router
│   ├── (participant)/      # 참가자 페이지
│   │   └── [eventId]/      # 이벤트별 페이지
│   ├── admin/              # Admin 페이지
│   └── layout.tsx          # 루트 레이아웃
├── components/             # React 컴포넌트
│   ├── admin/             # Admin 컴포넌트
│   ├── participant/       # 참가자 컴포넌트
│   └── ui/                # UI 컴포넌트
├── lib/                    # 유틸리티 및 설정
│   ├── supabaseClient.ts  # Supabase 클라이언트
│   ├── supabaseAdmin.ts   # Supabase Admin 클라이언트
│   ├── resend.ts          # Resend 이메일 발송
│   └── types.ts           # TypeScript 타입
├── actions/               # Server Actions
│   └── participant.ts    # 참가자 관련 액션
├── emails/                # React Email 템플릿
│   └── ConfirmationEmail.tsx
├── supabase/              # Supabase 설정
│   └── security_setup.sql # 보안 설정 SQL
├── docs/                  # 문서
└── vercel.json            # Vercel 설정
```

## 🛠️ 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **이메일**: Resend + React Email
- **배포**: Vercel / Render.com
- **UI 컴포넌트**: Custom Components

## 📦 주요 기능

### 참가자 기능

- Magic Link 로그인
- 단계별 등록 (기본 정보 → 여권 → 항공 → 호텔)
- QR PASS 생성 및 확인
- 확정 정보 확인

### Admin 기능

- 대시보드 (통계, 최근 참가자)
- 참가자 목록 및 상세 정보
- 확정 정보 입력 및 메일 발송
- 이벤트 브랜딩 설정

### 보안

- Row Level Security (RLS) 정책
- 멀티테넌트 구조
- Service Role Key를 통한 Admin 접근

## 🚀 배포

### Vercel 배포

1. GitHub 리포지토리 연결
2. 환경 변수 설정
3. 자동 배포 완료

자세한 내용은 [배포 가이드](./DEPLOYMENT.md)를 참조하세요.

### Render.com 배포

1. Dockerfile 사용
2. 환경 변수 설정
3. 자동 배포 완료

자세한 내용은 [Render.com 배포 가이드](./docs/RENDER_DEPLOYMENT.md)를 참조하세요.

## 📝 라이선스

ISC

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다.

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

