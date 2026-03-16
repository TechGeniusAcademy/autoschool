/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  allowedDevOrigins: ["192.168.8.17"],
  i18n: {
    locales: ["ru"],
    defaultLocale: "ru",
  },
  images: {
    remotePatterns: [
      // Разрешаем все HTTPS домены
      {
        protocol: "https",
        hostname: "**",
      },
      // Локальные адреса для разработки
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.8.17",
      },
      // Production сервер
      {
        protocol: "http",
        hostname: "82.115.43.207",
      },
    ],
    // Для production не оптимизируем изображения (проблемы с внешними)
    unoptimized: true,
  },
  // Настройки для production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Оптимизация для статических файлов
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "",
};

module.exports = nextConfig;
