// Конфигурация для разных сред
const config = {
  development: {
    SERVER_URL: 'http://localhost:3001',
    API_BASE_URL: 'http://localhost:3001/api',
  },
  production: {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://tdk-autoschool.kz',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tdk-autoschool.kz/api',
  }
};

// Определяем текущую среду
const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env as keyof typeof config] || config.development;

export const SERVER_URL = currentConfig.SERVER_URL;
export const API_BASE_URL = currentConfig.API_BASE_URL;

// Функция для получения полного URL аватара
export const getAvatarUrl = (avatarPath?: string | null): string | null => {
  if (!avatarPath) return null;
  // Если путь уже содержит домен, возвращаем как есть
  if (avatarPath.startsWith('http')) return avatarPath;
  // Иначе добавляем SERVER_URL
  return `${SERVER_URL}${avatarPath}`;
};

// Функция для получения полного URL файла
export const getFileUrl = (filePath?: string | null): string | null => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  return `${SERVER_URL}${filePath}`;
};
