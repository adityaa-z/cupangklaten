/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
