#!/bin/bash

# Event OS 배포 전 체크리스트 스크립트

echo "🚀 Event OS 배포 전 체크리스트 확인"
echo "=================================="
echo ""

# 1. 환경 변수 확인
echo "1️⃣ 환경 변수 확인..."
if [ -f .env.local ]; then
    echo "✅ .env.local 파일 존재"
    
    # 필수 환경 변수 확인
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "RESEND_API_KEY"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "✅ 모든 필수 환경 변수 확인됨"
    else
        echo "❌ 누락된 환경 변수:"
        for var in "${missing_vars[@]}"; do
            echo "   - $var"
        done
    fi
else
    echo "⚠️  .env.local 파일이 없습니다"
fi

echo ""

# 2. Next.js 빌드 테스트
echo "2️⃣ Next.js 빌드 테스트..."
if npm run build > /dev/null 2>&1; then
    echo "✅ 빌드 성공"
else
    echo "❌ 빌드 실패 - 로그를 확인하세요"
    npm run build
    exit 1
fi

echo ""

# 3. vercel.json 확인
echo "3️⃣ vercel.json 설정 확인..."
if [ -f vercel.json ]; then
    echo "✅ vercel.json 파일 존재"
else
    echo "⚠️  vercel.json 파일이 없습니다"
fi

echo ""

# 4. Git 상태 확인
echo "4️⃣ Git 상태 확인..."
if [ -d .git ]; then
    if [ -z "$(git status --porcelain)" ]; then
        echo "✅ 모든 변경사항이 커밋됨"
    else
        echo "⚠️  커밋되지 않은 변경사항이 있습니다"
        git status --short
    fi
    
    # 원격 저장소 확인
    if git remote | grep -q origin; then
        echo "✅ 원격 저장소 연결됨"
    else
        echo "⚠️  원격 저장소가 설정되지 않았습니다"
    fi
else
    echo "⚠️  Git 저장소가 아닙니다"
fi

echo ""
echo "=================================="
echo "✅ 체크리스트 완료!"
echo ""
echo "다음 단계:"
echo "1. Vercel 대시보드에서 환경 변수 설정 확인"
echo "2. Supabase Redirect URL 설정 확인"
echo "3. Storage 버킷 Public 설정 확인"
echo "4. git push origin main 으로 배포"


