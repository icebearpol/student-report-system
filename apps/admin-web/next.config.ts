import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@campus/shared-types',
    '@campus/mock-data',
    '@campus/ui-components',
  ],
};

export default nextConfig;
