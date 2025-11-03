/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 14
  webpack: (config, { isServer, webpack }) => {
    // Fix for node: imports in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'net': false,
        'tls': false,
        'dns': false,
        'stream': false,
        'events': false,
        'http': false,
        'https': false,
        'zlib': false,
        'path': false,
        'os': false,
        'crypto': false,
      };

      // Replace node: protocol imports with empty modules
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
