import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Render.com 배포를 위한 standalone 출력 활성화
  output: 'standalone',
};

export default nextConfig;

