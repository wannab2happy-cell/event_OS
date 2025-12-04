#!/bin/bash

# Event OS Admin - Production Deployment Check Script
# 이 스크립트는 배포 전 필수 항목을 검증합니다.

echo "============================================"
echo "Event OS Admin - Production Deployment Check"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
PASS=0
FAIL=0
WARN=0

# Function to check status
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo "1. Checking Git Status..."
echo "----------------------------"

# Check if git is clean
if git diff-index --quiet HEAD --; then
    check_pass "Git repository is clean"
else
    check_warn "Uncommitted changes detected"
fi

# Check current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    check_pass "On main/master branch: $BRANCH"
else
    check_warn "Not on main branch: $BRANCH"
fi

echo ""
echo "2. Checking Build Configuration..."
echo "----------------------------"

# Check if package.json exists
if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json not found"
fi

# Check if next.config.js exists
if [ -f "next.config.js" ]; then
    check_pass "next.config.js exists"
else
    check_warn "next.config.js not found (optional)"
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists (Cron configuration)"
    
    # Validate vercel.json
    if grep -q "/api/mail/worker" vercel.json; then
        check_pass "Mail worker cron configured"
    else
        check_fail "Mail worker cron not configured"
    fi
    
    if grep -q "/api/mail/scheduler" vercel.json; then
        check_pass "Mail scheduler cron configured"
    else
        check_fail "Mail scheduler cron not configured"
    fi
else
    check_fail "vercel.json not found - Cron jobs will not work!"
fi

echo ""
echo "3. Checking Environment Variables Template..."
echo "----------------------------"

# Check if .env.example exists
if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
    
    # Check required variables in .env.example
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "RESEND_API_KEY"
        "NEXT_PUBLIC_BASE_URL"
        "EVENT_BASE_URL"
        "CRON_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            check_pass "$var documented"
        else
            check_fail "$var not documented in .env.example"
        fi
    done
else
    check_fail ".env.example not found - Create it for documentation!"
fi

echo ""
echo "4. Checking API Routes..."
echo "----------------------------"

# Check if worker routes exist
if [ -f "app/api/mail/worker/route.ts" ]; then
    check_pass "Mail worker route exists"
    
    # Check if CRON_SECRET is implemented
    if grep -q "CRON_SECRET" app/api/mail/worker/route.ts; then
        check_pass "Mail worker has CRON_SECRET protection"
    else
        check_warn "Mail worker missing CRON_SECRET protection"
    fi
else
    check_fail "Mail worker route not found"
fi

if [ -f "app/api/mail/scheduler/route.ts" ]; then
    check_pass "Mail scheduler route exists"
    
    if grep -q "CRON_SECRET" app/api/mail/scheduler/route.ts; then
        check_pass "Mail scheduler has CRON_SECRET protection"
    else
        check_warn "Mail scheduler missing CRON_SECRET protection"
    fi
else
    check_fail "Mail scheduler route not found"
fi

if [ -f "app/api/message/worker/route.ts" ]; then
    check_pass "Message worker route exists"
    
    if grep -q "CRON_SECRET" app/api/message/worker/route.ts; then
        check_pass "Message worker has CRON_SECRET protection"
    else
        check_warn "Message worker missing CRON_SECRET protection"
    fi
else
    check_warn "Message worker route not found (optional)"
fi

echo ""
echo "5. Checking Documentation..."
echo "----------------------------"

required_docs=(
    "RELEASE_NOTES.md"
    "DEPLOYMENT_CHECKLIST.md"
    "PRODUCTION_DEPLOYMENT_GUIDE.md"
)

for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc not found"
    fi
done

echo ""
echo "6. Running Build Test..."
echo "----------------------------"

echo "Building project..."
if npm run build > /dev/null 2>&1; then
    check_pass "Build successful"
else
    check_fail "Build failed - Fix errors before deploying!"
    echo "Run 'npm run build' to see detailed errors"
fi

echo ""
echo "============================================"
echo "Deployment Check Summary"
echo "============================================"
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Ready for Production Deployment!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Set up Supabase Production project"
    echo "2. Configure Resend Production API"
    echo "3. Set Vercel Environment Variables"
    echo "4. Deploy: vercel --prod"
    echo ""
    echo "See PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions"
    exit 0
else
    echo -e "${RED}✗ Deployment NOT Ready - Fix the issues above${NC}"
    exit 1
fi




