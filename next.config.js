/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ✅ Allow builds to continue even if there are TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Disable ESLint checks during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
