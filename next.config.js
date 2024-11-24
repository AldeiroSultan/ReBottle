/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        undici: false,
      };
    }
    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;