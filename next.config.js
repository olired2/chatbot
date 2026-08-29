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
<<<<<<< HEAD
    suppressHydrationWarning: true,
=======
    serverComponentsExternalPackages: ['pdf2json'],
>>>>>>> 0216685e1e2dc6239d51091a40ee4c0806e78df8
  },
};

// Suppress deprecation warning from dependencies
process.noDeprecation = true;

module.exports = nextConfig;
