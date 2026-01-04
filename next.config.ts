import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.mindbridge.health https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://img.clerk.com; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.clerk.dev https://*.clerk.accounts.dev https://clerk.mindbridge.health https://*.clerk.com; frame-src 'self' https://*.clerk.accounts.dev https://clerk.mindbridge.health https://challenges.cloudflare.com; worker-src 'self' blob:; report-uri https://clerk.mindbridge.health/v1/csp_report;"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
