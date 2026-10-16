/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    agentUpgrade: "latest",
  },
};

module.exports = nextConfig;
