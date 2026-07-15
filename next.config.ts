import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-сборка: рекомендуется для Vercel, уменьшает размер lambda и ускоряет cold start.
  output: "standalone",
  typescript: {
    // Не игнорируем TS-ошибки при сборке — это заставляет ловить баги до деплоя.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // Превью-домены sandbox — в production не влияют, оставлены для локальной разработки.
  allowedDevOrigins: ["*.space-z.ai", "preview-chat-*.space-z.ai"],
  images: {
    // Разрешаем любые https-изображения (для OG-картинок, обложек статей/кейсов).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
