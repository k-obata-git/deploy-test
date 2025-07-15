import type { NextConfig } from "next";

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
  reactStrictMode: false,
  distDir: 'dist',
  devIndicators: false,
  // devIndicators: {
  //   appIsrStatus: false,
  //   buildActivity: false,
  //   position: "top-left"
  // },
};

export default nextConfig;
