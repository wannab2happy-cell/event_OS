# Event OS 배포 전 체크리스트 스크립트 (PowerShell)

Write-Host "🚀 Event OS 배포 전 체크리스트 확인" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. 환경 변수 확인
Write-Host "1️⃣ 환경 변수 확인..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "✅ .env.local 파일 존재" -ForegroundColor Green
    
    # 필수 환경 변수 확인
    $requiredVars = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "RESEND_API_KEY"
    )
    
    $missingVars = @()
    $content = Get-Content .env.local
    
    foreach ($var in $requiredVars) {
        $found = $false
        foreach ($line in $content) {
            if ($line -match "^${var}=") {
                $found = $true
                break
            }
        }
        if (-not $found) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "✅ 모든 필수 환경 변수 확인됨" -ForegroundColor Green
    } else {
        Write-Host "❌ 누락된 환경 변수:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "   - $var" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  .env.local 파일이 없습니다" -ForegroundColor Yellow
}

Write-Host ""

# 2. Next.js 빌드 테스트
Write-Host "2️⃣ Next.js 빌드 테스트..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 빌드 성공" -ForegroundColor Green
} else {
    Write-Host "❌ 빌드 실패 - 로그를 확인하세요" -ForegroundColor Red
    Write-Host $buildResult
    exit 1
}

Write-Host ""

# 3. vercel.json 확인
Write-Host "3️⃣ vercel.json 설정 확인..." -ForegroundColor Yellow
if (Test-Path vercel.json) {
    Write-Host "✅ vercel.json 파일 존재" -ForegroundColor Green
} else {
    Write-Host "⚠️  vercel.json 파일이 없습니다" -ForegroundColor Yellow
}

Write-Host ""

# 4. Git 상태 확인
Write-Host "4️⃣ Git 상태 확인..." -ForegroundColor Yellow
if (Test-Path .git) {
    $gitStatus = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "✅ 모든 변경사항이 커밋됨" -ForegroundColor Green
    } else {
        Write-Host "⚠️  커밋되지 않은 변경사항이 있습니다" -ForegroundColor Yellow
        git status --short
    }
    
    # 원격 저장소 확인
    $remotes = git remote
    if ($remotes -contains "origin") {
        Write-Host "✅ 원격 저장소 연결됨" -ForegroundColor Green
    } else {
        Write-Host "⚠️  원격 저장소가 설정되지 않았습니다" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Git 저장소가 아닙니다" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ 체크리스트 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. Vercel 대시보드에서 환경 변수 설정 확인"
Write-Host "2. Supabase Redirect URL 설정 확인"
Write-Host "3. Storage 버킷 Public 설정 확인"
Write-Host "4. git push origin main 으로 배포"


