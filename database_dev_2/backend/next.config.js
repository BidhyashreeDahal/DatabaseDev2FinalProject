/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid flaky filesystem cache writes on Windows dev environments.
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
