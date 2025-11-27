# UX/UI 디자인 가이드라인

## 디자인 철학

### 1. 애플의 미니멀리즘
- **핵심 원칙**: 불필요한 요소 제거, 본질에 집중
- **적용 방법**:
  - 깔끔한 화이트스페이스 활용
  - 최소한의 색상 팔레트 (주요 액션에만 색상 사용)
  - 명확한 계층 구조
  - 일관된 아이콘 사용

### 2. BTL 이벤트 특성 반영
- **비즈니스 이벤트 특성**:
  - 전문적이고 신뢰감 있는 디자인
  - 정보의 명확한 전달
  - 빠른 정보 인식
  - 현장 체크인 최적화

## 핵심 원칙

### 1. 모바일 퍼스트 (Mobile First)

#### 반응형 브레이크포인트
```css
/* 모바일 우선 접근 */
- 기본: 모바일 (320px ~ 640px)
- 태블릿: 641px ~ 1024px
- 데스크톱: 1025px 이상
```

#### 모바일 최적화 규칙
- 터치 타겟 최소 크기: **44px × 44px** (Apple HIG 기준)
- 한 손 조작 가능한 영역 배치
- 스크롤 최소화
- 빠른 로딩 속도 (3초 이내)

### 2. 고대비 QR 화면 (High Contrast)

#### QR 코드 디스플레이 규칙
- **배경**: 순수 흰색 (#FFFFFF)
- **QR 코드**: 순수 검정 (#000000)
- **최소 크기**: 모바일에서 최소 200px × 200px
- **여백**: QR 코드 주변 최소 20px 여백
- **조명 대응**: 어두운 환경에서도 스캔 가능하도록 고대비 유지

#### 접근성
- WCAG 2.1 AA 기준 준수 (대비율 4.5:1 이상)
- 색상만으로 정보 전달하지 않기
- 텍스트와 배경 명확한 대비

### 3. 명확한 타이포그래피

#### 폰트 계층 구조
```
제목 1 (H1): 32px / 40px line-height / Bold
제목 2 (H2): 24px / 32px line-height / Bold
제목 3 (H3): 20px / 28px line-height / SemiBold
본문 (Body): 16px / 24px line-height / Regular
본문 작은 (Small): 14px / 20px line-height / Regular
캡션 (Caption): 12px / 16px line-height / Regular
```

#### 폰트 패밀리
- **주 폰트**: Pretendard (한글 최적화)
- **Fallback**: system-ui, -apple-system, sans-serif
- **모노스페이스**: 숫자/코드 표시용

#### 타이포그래피 규칙
- **줄 간격**: 폰트 크기의 1.5배
- **자간**: 기본값 유지 (0.01em 이하)
- **단어 간격**: 기본값 유지
- **최대 줄 길이**: 75자 (가독성 최적)

### 4. 충분한 여백 (Whitespace)

#### 여백 규칙
- **컴포넌트 간 간격**: 최소 16px
- **섹션 간 간격**: 최소 32px
- **카드 내부 패딩**: 최소 24px
- **QR 코드 주변 여백**: 최소 20px

#### 여백 활용 원칙
- 정보 그룹핑을 위한 여백 활용
- 시각적 계층 구조 표현
- 집중도 향상

## 닐슨의 10가지 사용성 평가 기준 적용

### 1. 시스템 상태 가시성 (Visibility of System Status) ⭐ 최우선

#### 적용 방법
- **로딩 상태 표시**
  - 모든 비동기 작업에 로딩 인디케이터
  - 진행률 표시 (가능한 경우)
  - 예상 소요 시간 표시

- **상태 피드백**
  - 성공/실패 메시지 즉시 표시
  - 현재 단계 명확히 표시
  - 완료 상태 시각적 표시

#### 구현 예시
```tsx
// 로딩 상태
{loading && (
  <div className="flex items-center justify-center p-4">
    <Spinner className="w-6 h-6 animate-spin" />
    <span className="ml-2 text-sm text-gray-600">처리 중...</span>
  </div>
)}

// 성공 상태
{success && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    <CheckCircle className="w-5 h-5 text-green-600" />
    <p className="text-green-800">완료되었습니다</p>
  </div>
)}
```

### 2. 오류 방지 (Error Prevention) ⭐ 최우선

#### 적용 방법
- **입력 검증**
  - 실시간 유효성 검사
  - 명확한 입력 가이드
  - 위험한 작업 확인 다이얼로그

- **오류 메시지**
  - 명확하고 구체적인 오류 설명
  - 해결 방법 제시
  - 친절한 톤 유지

#### 구현 예시
```tsx
// 실시간 검증
<Input
  type="email"
  error={errors.email}
  helperText="올바른 이메일 형식을 입력해주세요"
/>

// 확인 다이얼로그
const handleDelete = () => {
  if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    // 삭제 실행
  }
};
```

### 3. 사용자 제어 및 자유도 (User Control and Freedom)

- 되돌리기 기능 제공
- 명확한 취소 버튼
- 이전 단계로 돌아가기 가능

### 4. 일관성 및 표준 (Consistency and Standards)

- 일관된 버튼 스타일
- 표준 아이콘 사용
- 예측 가능한 동작

### 5. 오류 인식, 진단, 복구 (Error Recognition, Diagnosis, and Recovery)

- 명확한 오류 메시지
- 복구 방법 제시
- 오류 발생 위치 표시

### 6. 기억 부담 최소화 (Recognition Rather Than Recall)

- 명확한 레이블
- 컨텍스트 정보 제공
- 자동 완성 기능

### 7. 유연성 및 효율성 (Flexibility and Efficiency of Use)

- 단축키 제공 (고급 사용자)
- 자주 사용하는 기능 빠른 접근
- 사용자 선호도 저장

### 8. 미적이고 미니멀한 디자인 (Aesthetic and Minimalist Design)

- 불필요한 정보 제거
- 핵심 정보만 표시
- 깔끔한 레이아웃

### 9. 오류 복구 지원 (Help Users Recognize, Diagnose, and Recover from Errors)

- 친절한 오류 메시지
- 해결 방법 제시
- 고객 지원 링크

### 10. 도움말 및 문서화 (Help and Documentation)

- 툴팁 제공
- 컨텍스트 도움말
- FAQ 섹션

## 색상 시스템

### 주요 색상
```css
/* Primary (주요 액션) */
--primary: #2563eb; /* Blue 600 */
--primary-hover: #1d4ed8; /* Blue 700 */
--primary-light: #dbeafe; /* Blue 100 */

/* Success */
--success: #10b981; /* Green 500 */
--success-light: #d1fae5; /* Green 100 */

/* Warning */
--warning: #f59e0b; /* Amber 500 */
--warning-light: #fef3c7; /* Amber 100 */

/* Error */
--error: #ef4444; /* Red 500 */
--error-light: #fee2e2; /* Red 100 */

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-900: #111827;
```

### 색상 사용 규칙
- **Primary**: 주요 CTA 버튼, 링크
- **Success**: 성공 메시지, 완료 상태
- **Warning**: 경고 메시지, 주의 필요
- **Error**: 오류 메시지, 삭제 버튼
- **Neutral**: 배경, 텍스트, 보조 요소

## 컴포넌트 디자인 규칙

### 버튼
- **Primary**: 주요 액션 (파란색)
- **Secondary**: 보조 액션 (회색)
- **Ghost**: 부가 액션 (투명)
- **Danger**: 위험한 액션 (빨간색)

### 입력 필드
- 명확한 레이블
- 플레이스홀더 텍스트
- 실시간 검증 피드백
- 에러 메시지 표시

### 카드
- 그림자: `shadow-sm` (미묘한 그림자)
- 테두리: `border border-gray-200`
- 패딩: 최소 24px
- 둥근 모서리: `rounded-lg` (8px)

## 애니메이션 및 전환

### 전환 효과
- **기본 전환**: `transition-all duration-200 ease-in-out`
- **호버 효과**: `hover:scale-105` (버튼)
- **로딩**: `animate-spin` (스피너)

### 애니메이션 원칙
- 빠르고 자연스러운 전환 (200-300ms)
- 과도한 애니메이션 지양
- 성능 최적화 (GPU 가속 활용)

## 접근성 (Accessibility)

### WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 지원
- 색상 대비 4.5:1 이상
- 포커스 인디케이터 명확

### 구현 방법
```tsx
// 키보드 접근성
<button
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="저장하기"
>
  저장
</button>

// 스크린 리더
<div role="status" aria-live="polite">
  {loading && <span>로딩 중...</span>}
</div>
```

## 모바일 최적화 체크리스트

- [ ] 터치 타겟 최소 44px × 44px
- [ ] 한 손 조작 가능한 레이아웃
- [ ] 스크롤 최소화
- [ ] 빠른 로딩 (3초 이내)
- [ ] 오프라인 대응 (가능한 경우)
- [ ] PWA 지원 (선택)

## QR 코드 디스플레이 가이드

### 필수 요구사항
- **크기**: 최소 200px × 200px (모바일)
- **대비**: 검정(#000000) / 흰색(#FFFFFF)
- **여백**: QR 코드 주변 최소 20px
- **배경**: 순수 흰색
- **조명**: 어두운 환경 대응 고려

### 구현 예시
```tsx
<div className="bg-white p-6 rounded-xl">
  <div className="w-[200px] h-[200px] mx-auto">
    <QRCodeSVG
      value={qrContent}
      size={200}
      level="H" // 높은 오류 복구 레벨
      bgColor="#FFFFFF"
      fgColor="#000000"
    />
  </div>
</div>
```

## 체크리스트

### 디자인 일관성
- [ ] 색상 시스템 일관성 유지
- [ ] 타이포그래피 계층 구조 준수
- [ ] 여백 규칙 준수
- [ ] 아이콘 스타일 통일

### 사용성
- [ ] 시스템 상태 명확히 표시
- [ ] 오류 방지 메커니즘 구현
- [ ] 명확한 피드백 제공
- [ ] 접근성 기준 준수

### 모바일 최적화
- [ ] 터치 타겟 크기 적절
- [ ] 반응형 레이아웃
- [ ] 빠른 로딩 속도
- [ ] 한 손 조작 가능

### QR 코드
- [ ] 고대비 유지
- [ ] 충분한 크기
- [ ] 적절한 여백
- [ ] 스캔 가능성 확인

