/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIXED: Properly nested typescript and eslint blocks
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;