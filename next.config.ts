import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel은 Next.js를 자동 감지하므로 output 설정 불필요
  // Render.com 배포 시에는 Dockerfile에서 별도 처리
};

export default nextConfig;

