import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow Looker Studio iframes from any origin
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
