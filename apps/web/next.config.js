/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cupperly.com', 'demo.cupperly.com', 'api.cupperly.com'],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // Note: Rewrites only work for same-domain requests
  // For production with separate API domain (api.cupperly.com),
  // the frontend will make direct requests to NEXT_PUBLIC_API_URL
  async rewrites() {
    // Only use rewrites in development (localhost)
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  output: 'standalone', // Required for Docker production builds
};

module.exports = nextConfig;
