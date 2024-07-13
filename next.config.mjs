/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'funtails.de',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
