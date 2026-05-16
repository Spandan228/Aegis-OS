/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://localhost:8080/ws', // Proxy to Backend
      },
      {
        source: '/api/simulator/:path*',
        destination: 'http://localhost:8001/:path*', // Proxy to Simulator
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Proxy to Backend
      }
    ];
  },
};

export default nextConfig;
