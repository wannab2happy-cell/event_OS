# Mail Center 기능 - 초기 체크리스트

## 현재 기능: Mail Center / 단계: 준비 단계 (초기 체크리스트 작성)

---

## Checklist

### Step 1: DB 스키마 생성
- [x] `supabase/migrations/20251201111417_mail_center_tables.sql` 생성 완료
  - `email_templates` 테이블 (템플릿 관리)
    - id, event_id, name, subject, body_html, variables (JSONB), created_at, updated_at
  - `email_jobs` 테이블 (발송 작업)
    - id, event_id, template_id, status, recipient_count, sent_count, failed_count, scheduled_at, started_at, completed_at, created_at
  - `email_logs` 테이블 (발송 로그)
    - id, job_id, participant_id, email, status, error_message, sent_at, created_at
  - 인덱스 및 외래키 설정 완료

### Step 2: 타입 정의 및 유틸리티
- [x] `lib/mail/types.ts` 생성 완료
  - EmailTemplate, EmailJob, EmailLog 타입 정의
  - EmailJobStatus, EmailLogStatus 타입 정의
- [x] `lib/mail/utils.ts` 생성 완료
  - 템플릿 변수 치환 함수 (applyTemplateVariables)
  - 배치 처리를 위한 chunkArray 함수

### Step 3: 서버 액션 (Server Actions)
- [x] `actions/mail/createTemplate.ts` 생성 완료
- [x] `actions/mail/updateTemplate.ts` 생성 완료
- [x] `actions/mail/getTemplates.ts` 생성 완료
- [x] `actions/mail/deleteTemplate.ts` 생성 완료
- [x] `actions/mail/sendBulkEmail.ts` 생성 완료
- [x] `actions/mail/getJobs.ts` 생성 완료
- [x] `actions/mail/getEmailLogs.ts` 생성 완료
- [x] `lib/mail/sender.ts` 생성 완료

### Step 4: UI 컴포넌트
- [x] `app/admin/events/[eventId]/mail/components/TemplateList.tsx` 생성 완료
- [x] `app/admin/events/[eventId]/mail/components/TemplateEditor.tsx` 생성 완료
- [x] `app/admin/events/[eventId]/mail/components/JobList.tsx` 생성 완료
- [x] `app/admin/events/[eventId]/mail/components/LogList.tsx` 생성 완료
- [x] `app/admin/events/[eventId]/mail/components/SendEmailDialog.tsx` 생성 완료
- [x] `app/admin/events/[eventId]/mail/page.tsx` 생성 완료
- [x] `components/ui/Select.tsx` 생성 완료

### Step 5: 메인 페이지 및 통합
- [x] `app/admin/events/[eventId]/mail/page.tsx` 통합 완료
  - 템플릿 관리 탭
  - 발송 작업 탭
  - 발송 로그 탭
  - 로딩 스피너 및 에러 핸들링 추가
  - 토스트 알림 통합
- [x] `components/ui/useToast.ts` 생성 완료
- [x] `components/ui/LoadingSpinner.tsx` 생성 완료
- [x] 모든 컴포넌트에 토스트 알림 추가 완료
- [x] `lib/mail/sender.ts` 생성 완료 (템플릿 기반 이메일 발송)
- [x] AdminSidebar에 Mail Center 링크 확인 (이미 존재함)

### Step 6: Participants 연동
- [x] `actions/mail/getRecipients.ts` 생성 완료
  - event_participants 테이블에서 참가자 목록 자동 조회
  - 변수 자동 매핑 (name, company, position)
- [x] `SendEmailDialog.tsx` 수정 완료
  - 참가자 목록 자동 로드
  - 로딩 스피너 추가
  - recipients prop 제거
- [x] `page.tsx` 수정 완료
  - recipients prop 제거

### Step 7: Template Preview Modal
- [x] `actions/mail/renderPreview.ts` 생성 완료
  - 템플릿 HTML + variables를 적용해서 완성된 HTML 반환
- [x] `components/ui/Dialog.tsx` 생성 완료
  - 모달 다이얼로그 컴포넌트
- [x] `app/admin/events/[eventId]/mail/components/TemplatePreviewModal.tsx` 생성 완료
  - 변수 적용된 HTML을 iframe으로 렌더링
- [x] `TemplateEditor.tsx` 수정 완료
  - Preview 버튼 추가
  - 미리보기 모달 연동

---

## 예상 파일 구조

```
supabase/migrations/
  └── xxxx_mail_center_tables.sql

lib/mail/
  ├── types.ts
  └── utils.ts

actions/mail/
  ├── templates.ts
  ├── jobs.ts
  └── logs.ts

components/admin/mail/
  ├── TemplateList.tsx
  ├── TemplateEditor.tsx
  ├── JobCreator.tsx
  ├── JobList.tsx
  └── EmailLogs.tsx

app/admin/events/[eventId]/mail-center/
  └── page.tsx

lib/
  └── resend.ts (확장)
```

---

## 다음 단계

지금은 Step 1 (DB 스키마 생성)부터 시작합니다.
나머지는 다음 턴에서 이어가겠습니다.

