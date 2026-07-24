/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
 
  images: {
    unoptimized: true,
 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sunnyskitchen.kitchen",
        pathname: "/sunny/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};
 
module.exports = nextConfig;