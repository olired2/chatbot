/** @type {import('next').NextConfig} */

// Suprime el aviso de deprecación de url.parse() de dependencias externas
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Suprimir advertencias de deprecación de dependencias
  experimental: {
    suppressHydrationWarning: true,
  },
};

// Suppress deprecation warning from dependencies
process.noDeprecation = true;

module.exports = nextConfig;
