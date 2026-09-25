/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Tells browsers to always use https for this domain from now on,
        // even if someone types http:// or an old link points to http.
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
 
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