const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['resources.premierleague.com', 'platform-static-files.s3.amazonaws.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'fplhelper.vercel.app'],
    },
  },
  async redirects() {
    return [];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig); 