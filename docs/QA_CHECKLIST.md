# Event OS - Full QA Checklist

**총 52개 항목** | Event OS 전체 기능 + Mail Center + Participant Front + TA Engine 통합 QA

---

## A. 테이블 엔진 (Algorithm / Draft / Confirm) – 18개

### Algorithm Tests

- [ ] **A1.** Round Robin 실행 시 모든 테이블에 균등 분배되는가
  - 테스트: 100명 참가자, 10개 테이블 → 각 테이블 10명씩 배정
  - 검증: 각 테이블 인원 수 차이 ≤ 1

- [ ] **A2.** VIP Spread 실행 시 VIP가 골고루 퍼지는가
  - 테스트: VIP 20명, 일반 80명, 10개 테이블
  - 검증: 각 테이블 VIP 수 차이 ≤ 1

- [ ] **A3.** Group By Company 실행 시 회사별 군집이 최소 테이블로 배정되는가
  - 테스트: 회사 A 15명, 회사 B 10명, 회사 C 5명, 테이블 capacity 10
  - 검증: 회사 A는 2개 테이블, 회사 B는 1개 테이블, 회사 C는 1개 테이블

- [ ] **A4.** 테이블 용량(capacity)을 초과하지 않는가
  - 테스트: capacity 10인 테이블에 11명 배정 시도
  - 검증: 용량 초과 방지 및 경고 표시

### Draft & Confirm States

- [ ] **A5.** Draft 상태에서 UI 상 참가자 수가 정확한가
  - 테스트: Draft 생성 후 TableCard의 (현재인원/용량) 표시
  - 검증: 실제 배정 인원과 UI 표시 일치

- [ ] **A6.** Confirm 시 Draft가 정상적으로 확정되는가
  - 테스트: Draft 생성 → Confirm 클릭
  - 검증: `is_draft = false`로 변경, Draft 데이터 삭제

- [ ] **A7.** Draft → Clear Draft 수행 시 데이터 초기화되는가
  - 테스트: Draft 생성 → Clear Draft 클릭
  - 검증: `is_draft = true` 레코드 모두 삭제

### Manual Drag & Drop

- [ ] **A8.** Manual Drag 시 이동 직후 UI 반영이 즉시 이루어지는가
  - 테스트: 참가자 A를 Table 1 → Table 2로 드래그
  - 검증: 즉시 UI 업데이트, 서버 저장 전 로컬 상태 반영

- [ ] **A9.** Manual Drag 시 용량 초과일 때 경고 후 차단되는가
  - 테스트: 용량 10인 테이블에 10명 있을 때 추가 드래그
  - 검증: 경고 메시지 표시, 드롭 차단

### Smart Fix & Rebalance

- [ ] **A10.** SmartFix – 용량 초과 해결 정확성
  - 테스트: Table 1에 12명 (capacity 10) → SmartFix 실행
  - 검증: 초과 인원이 다른 테이블로 이동, 모든 테이블 용량 준수

- [ ] **A11.** SmartFix – 중복 배정 해결 정확성
  - 테스트: 참가자 A가 2개 테이블에 배정됨 → SmartFix 실행
  - 검증: 참가자 A가 1개 테이블에만 배정

- [ ] **A12.** SmartFix – 미배정 해결 정확성
  - 테스트: 참가자 5명이 미배정 상태 → SmartFix 실행
  - 검증: 모든 참가자가 테이블에 배정됨

- [ ] **A13.** SmartFix – VIP 편중 해결 정확성
  - 테스트: Table 1에 VIP 8명, Table 2에 VIP 0명 → SmartFix 실행
  - 검증: VIP가 균등 분산됨

- [ ] **A14.** SmartRebalance – 전체 균형 재조정 정확성
  - 테스트: 불균형 배정 (Table 1: 15명, Table 2: 5명) → Rebalance 실행
  - 검증: 모든 테이블 인원 수 차이 ≤ 1

### Preview & Versioning

- [ ] **A15.** Preview 비교 화면 Before/After 반영 정확성
  - 테스트: SmartFix 실행 전 Preview 모달 열기
  - 검증: Before/After 차이점 정확히 표시

- [ ] **A16.** Versioning – Save 후 버전이 증가하는가
  - 테스트: Draft 저장 → VersionHistory 확인
  - 검증: version_number가 1 증가

- [ ] **A17.** Version Restore – 이전 상태로 완전 복구되는가
  - 테스트: Version 2 선택 → Restore 클릭
  - 검증: 현재 배정이 Version 2 상태로 복구

- [ ] **A18.** Undo/Redo – 드래그/SmartFix/Rebalance 모두 추적되는가
  - 테스트: 드래그 → Undo → Redo → SmartFix → Undo
  - 검증: 각 단계가 정확히 되돌아가고 재적용됨

---

## B. Admin UI – Tables Page – 8개

- [ ] **B1.** Algorithm Selector 변경 시 상태가 유지되는가
  - 테스트: Round Robin 선택 → 페이지 새로고침
  - 검증: 선택한 알고리즘이 유지됨

- [ ] **B2.** Draft/Confirmed 상태 배지 색상 정확성
  - 테스트: Draft 존재 시 노란색, Confirmed 존재 시 초록색
  - 검증: 상태에 맞는 색상 표시

- [ ] **B3.** TableCard 렌더링 메모이제이션 – 재렌더링 최소화
  - 테스트: 다른 테이블 드래그 시 다른 TableCard는 재렌더링 안 됨
  - 검증: React DevTools Profiler로 확인

- [ ] **B4.** Virtualization 조건(10개 넘는 테이블) 정확 작동
  - 테스트: 15개 테이블 생성 → 스크롤 테스트
  - 검증: VirtualizedTableList 사용, 스크롤 부드러움

- [ ] **B5.** TableCard 안에서 VIP/Company 정보 정확히 노출
  - 테스트: VIP 참가자, 회사명이 있는 참가자 확인
  - 검증: VIP 배지, 회사명 표시 정확

- [ ] **B6.** WarningBadge가 정확한 문제를 표시하는가
  - 테스트: 용량 초과 테이블에 빨간 배지 표시
  - 검증: 문제 유형에 맞는 배지 색상/아이콘

- [ ] **B7.** VersionHistory Pagination 동작
  - 테스트: 30개 버전 생성 → 페이지네이션 테스트
  - 검증: 20개씩 로드, "Load More" 버튼 동작

- [ ] **B8.** Version Restore Modal이 정상 닫히는가
  - 테스트: Restore Modal 열기 → Cancel/Close 클릭
  - 검증: 모달이 닫히고 상태 변경 없음

---

## C. Participant Front – 8개

- [ ] **C1.** /events/[eventCode] 홈 페이지 정상 로드
  - 테스트: 유효한 eventCode로 접속
  - 검증: 이벤트 정보, Quick Actions 표시

- [ ] **C2.** welcome tagline 노출
  - 테스트: 이벤트에 hero_tagline 설정
  - 검증: tagline이 홈 페이지에 표시

- [ ] **C3.** Quick Actions 이동 정상 (일정/장소/My Table)
  - 테스트: 각 Quick Action 카드 클릭
  - 검증: 해당 페이지로 정상 이동

- [ ] **C4.** Schedule 페이지 날짜별 그룹 정상
  - 테스트: 여러 날짜의 세션 생성
  - 검증: 날짜별로 그룹핑되어 표시

- [ ] **C5.** Venue 링크(Google Maps) 정상 이동
  - 테스트: venue_map_url이 있는 이벤트
  - 검증: "지도 열기" 링크 클릭 시 새 탭에서 Google Maps 열림

- [ ] **C6.** My Table – 배정된 테이블명 정확히 노출
  - 테스트: Confirmed 배정이 있는 참가자로 접속
  - 검증: 테이블명이 정확히 표시

- [ ] **C7.** My Table – VIP 배지 표시
  - 테스트: VIP 참가자로 접속
  - 검증: VIP 배지/아이콘 표시

- [ ] **C8.** My Table – 배정 없음 시 안내 문구 표시
  - 테스트: 배정이 없는 참가자로 접속
  - 검증: "아직 테이블 배정이 확정되지 않았습니다" 메시지 표시

---

## D. Mail Center – Templates – 8개

- [ ] **D1.** Template List에서 검색이 정상 작동
  - 테스트: 템플릿 이름/제목으로 검색
  - 검증: 필터링된 결과만 표시

- [ ] **D2.** Template 생성 → 목록에 즉시 반영
  - 테스트: 새 템플릿 생성 → Mail Center로 리다이렉트
  - 검증: 목록에 새 템플릿 표시

- [ ] **D3.** merge_variables 자동 추출 정확성
  - 테스트: HTML에 `{{name}}`, `{{tableName}}` 포함 → 자동 추출 버튼 클릭
  - 검증: merge_variables 배열에 정확히 포함

- [ ] **D4.** Preview 모달 HTML 적용 정상
  - 테스트: Preview 모달 열기 → HTML 탭 확인
  - 검증: 머지 변수가 적용된 HTML 렌더링

- [ ] **D5.** Preview 모달 Text 적용 정상
  - 테스트: Preview 모달 열기 → Text 탭 확인
  - 검증: 머지 변수가 적용된 텍스트 표시

- [ ] **D6.** Template 수정 후 updated_at 반영
  - 테스트: 템플릿 수정 → 저장
  - 검증: updated_at이 현재 시각으로 업데이트

- [ ] **D7.** Template 삭제 시 목록 갱신
  - 테스트: 템플릿 삭제 → 확인
  - 검증: 목록에서 즉시 제거

- [ ] **D8.** merge variable 미기재 시 오류 처리
  - 테스트: 템플릿에 `{{unknownVar}}` 포함 → Preview
  - 검증: 변수가 `[unknownVar]`로 표시되거나 경고 표시

---

## E. Mail Center – Jobs & Logs – 8개

- [ ] **E1.** SendPanel에서 템플릿 선택 정상
  - 테스트: 드롭다운에서 템플릿 선택
  - 검증: 선택한 템플릿이 표시됨

- [ ] **E2.** 필터 조건(is_vip, company, status) 적용 정확성
  - 테스트: VIP만 선택 → Job 생성
  - 검증: total_count가 VIP 참가자 수와 일치

- [ ] **E3.** Job 생성 후 Job List에 반영
  - 테스트: SendPanel에서 Job 생성
  - 검증: Jobs 페이지에 새 Job 표시

- [ ] **E4.** Run Job 수행 → status = processing
  - 테스트: Run Job 버튼 클릭
  - 검증: Job 상태가 즉시 "processing"으로 변경

- [ ] **E5.** 발송 완료 → status = completed
  - 테스트: 모든 이메일 발송 완료
  - 검증: Job 상태가 "completed"로 변경

- [ ] **E6.** 실패 케이스 → status = failed
  - 테스트: Resend API 키 없음 또는 오류 발생
  - 검증: Job 상태가 "failed"로 변경

- [ ] **E7.** email_logs 테이블에 건별 기록
  - 테스트: Job 실행 후 Logs 확인
  - 검증: 각 참가자별로 로그 레코드 생성

- [ ] **E8.** LogsTable UI 리프레시 정상
  - 테스트: Job 실행 중 → 완료 후 페이지 새로고침
  - 검증: 최신 로그가 표시됨

- [ ] **E9.** 성공/실패 건수가 맞는가
  - 테스트: 100명 중 95명 성공, 5명 실패
  - 검증: Job Summary에 success_count=95, fail_count=5 표시

- [ ] **E10.** Job Detail Summary 표시 정상
  - 테스트: Job Detail 페이지 접속
  - 검증: Total, Success, Failed 수치 정확히 표시

---

## QA 실행 가이드

### 환경 준비
1. `.env.local`에 다음 변수 설정:
   - `RESEND_API_KEY`
   - `MAIL_FROM_ADDRESS` 또는 `RESEND_DOMAIN`
   - `NEXT_PUBLIC_BASE_URL` 또는 `NEXT_PUBLIC_SITE_URL`

2. Supabase 데이터베이스 준비:
   - 테스트 이벤트 생성
   - 테스트 참가자 데이터 준비
   - 테이블 생성

### 실행 순서
1. **A. 테이블 엔진** (18개) - 먼저 실행
2. **B. Admin UI** (8개) - 테이블 엔진 완료 후
3. **C. Participant Front** (8개) - 독립 실행 가능
4. **D. Mail Center Templates** (8개) - 독립 실행 가능
5. **E. Mail Center Jobs & Logs** (8개) - D 완료 후

### 체크리스트 사용법
- 각 항목을 체크하면서 테스트 수행
- 실패한 항목은 별도 문서에 기록
- 스크린샷/로그 첨부 권장

---

**마지막 업데이트:** 2024년
**QA 담당자:** ________________
**테스트 환경:** Development / Staging / Production

