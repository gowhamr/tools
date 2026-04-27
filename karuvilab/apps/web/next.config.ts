import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['clsx', 'tailwind-merge'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-DNS-Prefetch-Control', value: 'on' }],
      },
    ]
  },
}

export default nextConfig
