# Event OS - Full QA Simulation Scenarios

**운영자 테스트 프로세스** | 실제 운영자가 시스템을 사용하는 전체 여정을 시뮬레이션

---

## 시나리오 1 – 200명 데이터 기반 실제 테이블 배정

### 목표
대규모 이벤트(200명 참가자)에서 테이블 배정 엔진의 전체 기능을 검증

### 준비 단계

1. **이벤트 생성**
   ```
   - 이벤트명: "QA Test Event 2024"
   - Event Code: "qa-test-2024"
   - 날짜: 2024-12-15 ~ 2024-12-16
   - 장소: "Test Venue"
   ```

2. **20개 테이블 생성**
   ```
   Table 1 ~ Table 20
   각 테이블 capacity: 10
   VIP 테이블: Table 1, Table 2 (is_vip_table = true)
   ```

3. **참가자 200명 업로드**
   ```
   - VIP: 12명 (is_vip = true)
   - 일반: 188명
   - 회사 분포:
     * Company A: 30명
     * Company B: 25명
     * Company C: 20명
     * Company D: 15명
     * Company E: 10명
     * Company F: 8명
     * Company G: 5명
     * Company H: 3명
     * 기타/개인: 84명
   ```

### 실행 단계

#### Step 1.1: Round Robin 실행 → Draft 생성
1. `/admin/events/[eventId]/tables` 접속
2. Algorithm Selector에서 "Round Robin" 선택
3. "Run Draft" 버튼 클릭
4. **검증:**
   - 각 테이블에 약 10명씩 배정됨
   - Draft 상태 배지가 노란색으로 표시
   - TableCard에 (현재인원/10) 정확히 표시

#### Step 1.2: SmartFix 자동 해결 실행
1. ConflictInspector에서 문제 확인
2. "Auto-Fix All" 버튼 클릭
3. **검증:**
   - 용량 초과 문제 해결
   - 중복 배정 제거
   - 미배정 참가자 배정

#### Step 1.3: 수동 드래그로 특정 VIP를 T1 왼쪽으로 이동
1. VIP 참가자 1명을 Table 1로 드래그
2. **검증:**
   - 즉시 UI 반영
   - 용량 체크 정상 작동
   - Save Draft Changes 버튼 활성화

#### Step 1.4: Undo/Redo 3회 반복
1. 드래그 수행 → Undo 클릭
2. Redo 클릭
3. SmartFix 실행 → Undo 클릭
4. **검증:**
   - 각 단계가 정확히 되돌아감
   - Redo로 재적용됨
   - 상태 일관성 유지

#### Step 1.5: 버전 저장 → VersionHistory에서 확인
1. "Save Draft Changes" 클릭
2. VersionHistoryPanel 열기
3. **검증:**
   - 새 버전이 목록 상단에 표시
   - version_number가 증가
   - created_at이 현재 시각

#### Step 1.6: Confirm 수행
1. "Confirm Assignment" 버튼 클릭
2. 확인 다이얼로그에서 확인
3. **검증:**
   - Draft 데이터 삭제
   - Confirmed 배정 생성 (is_draft = false)
   - 상태 배지가 초록색으로 변경

---

## 시나리오 2 – Participant Front 전체 경험

### 목표
참가자 관점에서 전체 프론트엔드 기능 검증

### 준비 단계

1. **이벤트 설정**
   ```
   - Event Code: "qa-test-2024"
   - hero_tagline: "Welcome to QA Test Event"
   - start_date: 2024-12-15
   - end_date: 2024-12-16
   - location_name: "Test Venue"
   - venue_map_url: "https://maps.google.com/..."
   ```

2. **세션 데이터**
   ```
   - Session 1: 2024-12-15 09:00 ~ 10:00, "Opening"
   - Session 2: 2024-12-15 10:30 ~ 12:00, "Keynote"
   - Session 3: 2024-12-15 14:00 ~ 15:30, "Workshop"
   ```

3. **참가자 배정**
   ```
   - 참가자 ID: participant-123
   - Confirmed 배정: Table 3
   ```

### 실행 단계

#### Step 2.1: /events/[code] 접속
1. 브라우저에서 `/events/qa-test-2024` 접속
2. **검증:**
   - 이벤트 제목 표시
   - hero_tagline 표시
   - 날짜 범위 표시
   - 장소명 표시

#### Step 2.2: Quick Action 동작 테스트
1. "내 테이블 확인" 카드 클릭
   - **검증:** `/events/qa-test-2024/my-table?pid=participant-123`로 이동
2. "전체 일정 보기" 카드 클릭
   - **검증:** `/events/qa-test-2024/schedule`로 이동
3. "장소 상세 보기" 링크 클릭
   - **검증:** `/events/qa-test-2024/venue`로 이동

#### Step 2.3: Schedule 타임라인 확인
1. Schedule 페이지에서 세션 목록 확인
2. **검증:**
   - 날짜별로 그룹핑됨
   - 시간 순서대로 정렬
   - 세션 제목, 시간, 장소 표시

#### Step 2.4: Venue 안내 확인
1. Venue 페이지에서 장소 정보 확인
2. "지도 열기" 링크 클릭
3. **검증:**
   - 장소명 표시
   - 상세 정보 표시
   - Google Maps 링크가 새 탭에서 열림

#### Step 2.5: My Table 페이지 확인
1. `/events/qa-test-2024/my-table?pid=participant-123` 접속
2. **검증:**
   - 참가자 이름 표시
   - 회사명 표시 (있는 경우)
   - VIP 배지 표시 (VIP인 경우)
   - 테이블명: "Table 3" 표시
   - 수용 인원 표시

---

## 시나리오 3 – Mail Center 템플릿 + 발송

### 목표
Mail Center의 템플릿 생성부터 실제 발송까지 전체 프로세스 검증

### 준비 단계

1. **이벤트 및 참가자**
   ```
   - 이벤트: "qa-test-2024"
   - VIP 참가자: 12명
   - 일반 참가자: 188명
   - 모든 참가자에 이메일 주소 설정
   ```

2. **테이블 배정**
   ```
   - Confirmed 배정 완료
   - 모든 참가자가 테이블 배정됨
   ```

### 실행 단계

#### Step 3.1: Welcome Template 생성
1. `/admin/events/[eventId]/mail` 접속
2. "New Template" 버튼 클릭
3. 템플릿 정보 입력:
   ```
   Name: "Welcome Email"
   Subject: "Welcome {{name}} to {{eventName}}"
   HTML Body:
   <h1>Hello {{name}}!</h1>
   <p>Your table is {{tableName}}.</p>
   <p><a href="{{myTableUrl}}">View My Table</a></p>
   ```
4. "자동 추출" 버튼 클릭
5. **검증:**
   - merge_variables에 name, eventName, tableName, myTableUrl 포함
6. "Create Template" 클릭
7. **검증:**
   - 템플릿 목록에 즉시 반영

#### Step 3.2: HTML/Text preview 확인
1. 템플릿 목록에서 "Preview" 버튼 클릭
2. HTML 탭 확인
3. **검증:**
   - 샘플 변수가 적용된 HTML 렌더링
   - 링크가 정상 표시
4. Text 탭 확인
5. **검증:**
   - 텍스트 버전이 정상 표시

#### Step 3.3: SendPanel에서 VIP만 발송
1. Mail Center 메인 페이지로 이동
2. SendPanel에서:
   - Template: "Welcome Email" 선택
   - Filters: "VIP만 발송" 체크
3. "Create Send Job" 클릭
4. **검증:**
   - Job이 생성됨
   - total_count = 12 (VIP 수)

#### Step 3.4: Job 생성 확인
1. Jobs 페이지로 이동
2. **검증:**
   - 새 Job이 목록 상단에 표시
   - Status: "pending"
   - Total: 12

#### Step 3.5: Run Job 실행
1. Job Detail 페이지 접속
2. "Run Job" 버튼 클릭
3. **검증:**
   - Status가 즉시 "processing"으로 변경
   - 진행 중 메시지 표시

#### Step 3.6: Logs에서 성공/실패 확인
1. Job 완료 후 LogsTable 확인
2. **검증:**
   - 12개 로그 레코드 생성
   - 각 참가자별 status (success/failed)
   - 성공한 경우 sent_at 기록
   - 실패한 경우 error_message 기록

#### Step 3.7: 참가자 Gmail에서 메일 수신 및 링크 테스트
1. 테스트 Gmail 계정 확인
2. **검증:**
   - 이메일 수신 확인
   - 제목에 참가자 이름 포함
   - 본문에 테이블명 포함
   - "View My Table" 링크 포함

#### Step 3.8: My Table 링크 정상 접속
1. 이메일의 "View My Table" 링크 클릭
2. **검증:**
   - My Table 페이지로 이동
   - 참가자 정보 정확히 표시
   - 테이블 정보 정확히 표시

---

## 시나리오 4 – 전체 메시지 흐름 검증

### 목표
실제 운영 환경에서 발생할 수 있는 엣지 케이스 검증

### 준비 단계

1. **참가자 데이터 준비**
   ```
   - Company A 소속 참가자: 30명
   - 참가자 1명의 이메일 주소를 고의로 잘못 설정: "invalid-email"
   ```

### 실행 단계

#### Step 4.1: 회사 A 포함 필터 발송
1. SendPanel에서:
   - Template: "Welcome Email" 선택
   - Company 필터: "Company A" 입력
2. "Create Send Job" 클릭
3. **검증:**
   - total_count = 30

#### Step 4.2: 참가자 1명 이메일 주소 고의 오류 설정
1. 참가자 편집 페이지에서 이메일을 "invalid-email"로 변경
2. 저장

#### Step 4.3: Run Job 실행
1. Job Detail에서 "Run Job" 클릭
2. 완료 대기

#### Step 4.4: 실패 로그 검증
1. LogsTable 확인
2. **검증:**
   - 29개 success 로그
   - 1개 failed 로그
   - failed 로그의 error_message에 이메일 오류 내용 포함

#### Step 4.5: JobSummary에서 success/fail 합 계수 검증
1. Job Detail Summary 확인
2. **검증:**
   - Total: 30
   - Success: 29
   - Failed: 1
   - Success + Failed = Total

#### Step 4.6: Admin UI 새로고침 후 status 갱신 확인
1. 페이지 새로고침 (F5)
2. **검증:**
   - Job Status: "completed"
   - Summary 수치가 최신 상태로 표시
   - LogsTable이 최신 로그 표시

---

## 시나리오 5 – 성능 테스트 (선택)

### 목표
대규모 데이터에서 성능 검증

### 준비 단계

1. **대규모 데이터 생성**
   ```
   - 참가자: 1000명
   - 테이블: 50개 (각 capacity 20)
   ```

### 실행 단계

#### Step 5.1: 알고리즘 성능 테스트
1. Round Robin 실행
2. **검증:**
   - 실행 시간 < 100ms
   - UI 반응성 유지

#### Step 5.2: UI 렌더링 성능
1. TableList 렌더링
2. **검증:**
   - Virtualization 작동 (50개 테이블)
   - 스크롤 부드러움
   - 드래그 반응성 유지

#### Step 5.3: 대량 메일 발송
1. 1000명 대상 Job 생성
2. Run Job 실행
3. **검증:**
   - Job이 정상 완료
   - 모든 로그 기록
   - 성능 저하 없음

---

## 시나리오 실행 체크리스트

각 시나리오 실행 전:

- [ ] 테스트 환경 준비 완료
- [ ] 테스트 데이터 준비 완료
- [ ] 환경 변수 설정 확인 (RESEND_API_KEY 등)
- [ ] Supabase 연결 확인

각 시나리오 실행 후:

- [ ] 결과 기록
- [ ] 스크린샷 저장 (필요 시)
- [ ] 오류 로그 저장
- [ ] 다음 시나리오 준비

---

## 예상 소요 시간

- **시나리오 1:** 30-45분
- **시나리오 2:** 15-20분
- **시나리오 3:** 45-60분 (이메일 발송 대기 시간 포함)
- **시나리오 4:** 20-30분
- **시나리오 5:** 30-45분 (선택)

**총 예상 시간:** 2-3시간

---

**마지막 업데이트:** 2024년
**QA 담당자:** ________________
**테스트 환경:** Development / Staging / Production

