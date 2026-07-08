import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: '/api/bhuvan',
        destination: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms/',
      },
      {
        source: '/api/bhuvan-tms/:path*',
        destination: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/tms/:path*',
      }
    ];
  },
};

export default nextConfig;
