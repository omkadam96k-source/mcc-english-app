/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning ignores setup
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors ignores setup
    ignoreBuildErrors: true,
  },
};

export default nextConfig;