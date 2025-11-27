# Event OS - Render.com 배포용 Dockerfile
# Next.js 15 프로덕션 빌드 및 실행

# Node.js 20 LTS 사용
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json* ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production && \
    npm cache clean --force

# 개발 의존성 포함 전체 설치 (빌드용)
FROM base AS deps-dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci && \
    npm cache clean --force

# 빌드 단계
FROM base AS builder
WORKDIR /app

# 개발 의존성 복사
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정 (빌드 시 필요)
ENV NEXT_TELEMETRY_DISABLED=1

# Render.com 배포를 위한 standalone 출력 활성화
# next.config.ts에 output: 'standalone' 추가
RUN sed -i "s/reactStrictMode: true,/reactStrictMode: true,\n  output: 'standalone',/" next.config.ts

# 프로덕션 빌드 실행
RUN npm run build

# 프로덕션 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 시스템 사용자 생성 (보안)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next.js 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 소유권 변경
RUN chown -R nextjs:nodejs /app

# Next.js 사용자로 전환
USER nextjs

# 포트 노출 (Render.com 기본 포트: 10000)
EXPOSE 10000

ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

# Next.js 프로덕션 서버 실행
CMD ["node", "server.js"]

