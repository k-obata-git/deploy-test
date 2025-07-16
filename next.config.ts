import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // dev中は無効に
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // リクエストのパスパターン
        source: "/",
        // リダイレクト先
        destination: "/overview",
        // true : リダイレクトをキャッシュする（ステータスコード:308）
        // false: リダイレクトをキャッシュしない（ステータスコード:307）
        permanent: false,
      },
    ];
  },
  reactStrictMode: true,
  distDir: 'build',
  devIndicators: false,
  // devIndicators: {
  //   appIsrStatus: false,
  //   buildActivity: false,
  //   position: "top-left"
  // },
};

// export default nextConfig;

module.exports = withPWA(nextConfig);