import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during production build
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    const headers = [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevent clickjacking attacks
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevent MIME type sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Control referrer information
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // XSS protection for older browsers
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()', // Restrict dangerous permissions
          },
        ],
      },
    ];

    // Add production-only headers
    if (process.env.NODE_ENV === 'production') {
      headers[0].headers.push(
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload', // Force HTTPS
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for React
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com", // Allow inline styles and Google Fonts
            "font-src 'self' fonts.gstatic.com",
            "img-src 'self' data: blob: *.supabase.co", // Allow Supabase images
            "connect-src 'self' *.supabase.co api.openai.com", // Allow API connections
            "media-src 'self' blob:",
            "object-src 'none'", // Prevent object embedding
            "base-uri 'self'", // Restrict base tag
            "form-action 'self'", // Restrict form submissions
            "frame-ancestors 'none'", // Prevent embedding
            "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
          ].join('; '),
        }
      );
    }

    return headers;
  },
};

export default nextConfig;
