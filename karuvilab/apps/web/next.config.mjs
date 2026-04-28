/** @type {import('next').NextConfig} */
const nextConfig = {
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
