/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@campus/shared-types',
    '@campus/mock-data',
    '@campus/ui-components',
  ],
};

module.exports = nextConfig;
