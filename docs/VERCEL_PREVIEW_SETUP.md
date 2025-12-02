# Vercel Preview 환경 구축 가이드

**Phase A – Step 2: Vercel Dev(Preview) 환경 즉시 구축**

---

## 🎯 목적

- UI 실측 환경 제공
- 안정성 검증
- 병합 전 전략 수립
- 운영(main) 보호

---

## ✅ Step 2-1. Vercel에 dev 환경 생성

### ① Vercel 접속
https://vercel.com/dashboard

### ② EventOS 프로젝트 선택
프로젝트 이름 예:
- `event-os`
- `eventos-admin`
- `events.anders.kr`

(실제 이름은 Dashboard에서 한번 선택하면 됩니다)

---

## ✅ Step 2-2. Git dev 브랜치를 Preview 환경으로 연결

### Vercel 메뉴 경로
**Project Settings → Git → Preview Branches**

### 설정 내용
```
Preview Branches:
✔ dev
✔ feature/*
```

### PM 관점
- `dev` 브랜치 → Preview 환경 자동 배포
- `feature/*` 브랜치도 Preview 활성화되면 브라우저 실측 가능

---

## ✅ Step 2-3. Preview 환경 변수(dev와 main 분리)

### Vercel Settings 경로
**Settings → Environment Variables**

### Production(운영) 환경 변수
이미 존재하는 변수들:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://events.anders.kr
RESEND_API_KEY=...
MAIL_FROM_ADDRESS=...
```

### Preview(새로 추가) 환경 변수
**중요:** Preview에는 Production과 동일한 값 사용하되, URL만 다름

```
NEXT_PUBLIC_SUPABASE_URL=<Production과 동일>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Production과 동일>
NEXT_PUBLIC_APP_URL=https://eventos-dev.vercel.app
RESEND_API_KEY=<Production과 동일>
MAIL_FROM_ADDRESS=<Production과 동일>
```

### ⚠️ 주의사항
- **Service Role Key는 Preview에 절대 넣지 않음**
- Preview는 client side만 사용
- Production과 동일한 DB 사용 (데이터 분리 불필요)

---

## ✅ Step 2-4. dev 브랜치 push → 자동 Preview 생성

### Git 명령어 (이미 실행됨)
```bash
git checkout -b dev
git add .
git commit -m "Initialize Vercel Preview Env"
git push -u origin dev
```

### 자동 생성되는 Preview URL
```
https://eventos-dev.vercel.app
```

또는 Vercel이 자동 생성한 URL:
```
https://event-os-{hash}.vercel.app
```

### 실측 가능한 기능
- ✅ Admin Dashboard
- ✅ Participant Front
- ✅ Mail Center
- ✅ Table Assignment
- ✅ 모든 Admin 기능

---

## ✅ Step 2-5. 운영(main) 완전 보호 상태 확립

### 브랜치 전략

#### 실험/디자인/UI 변경
→ `dev` 브랜치 또는 `feature/*` 브랜치에서 작업

#### 운영(main)
→ 실측 완료 후 merge
→ 항상 안정적인 상태 유지

### 워크플로우
```
1. feature/xxx 브랜치 생성
2. 개발 및 테스트
3. Preview 환경에서 실측
4. 문제 없으면 dev로 merge
5. dev에서 최종 검증
6. main으로 merge (운영 배포)
```

---

## 🟦 Phase A 완료 체크리스트

- [x] dev 브랜치 생성
- [x] feature/* 브랜치 구조 확립
- [ ] Vercel Preview 활성화 (Vercel 대시보드에서 설정 필요)
- [ ] Preview 환경 변수 분리 (Vercel 대시보드에서 설정 필요)
- [x] main이 보호 상태로 전환
- [x] 실측 환경 준비 완료

---

## 📝 다음 단계

1. **Vercel 대시보드에서 설정:**
   - Preview Branches 설정
   - Preview Environment Variables 설정

2. **Preview URL 확인:**
   - Vercel Dashboard → Deployments
   - dev 브랜치의 Preview URL 확인

3. **실측 테스트:**
   - Admin Dashboard 접속
   - 모든 기능 정상 작동 확인

---

## 🔗 유용한 링크

- Vercel Dashboard: https://vercel.com/dashboard
- Preview Branches 설정: Project Settings → Git → Preview Branches
- Environment Variables 설정: Settings → Environment Variables

---

**마지막 업데이트:** 2024년
**담당자:** ________________

