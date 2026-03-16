import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Функция для генерации уникального имени файла
const generateFileName = (req: Request, file: Express.Multer.File, cb: Function) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const fileName = `avatar-${req.user?.id}-${uniqueSuffix}${extension}`;
  cb(null, fileName);
};

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/avatars');
  },
  filename: generateFileName
});

// Фильтр для проверки типов файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// Настройка multer
export const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимальный размер
  },
  fileFilter: fileFilter
});

// Middleware для обработки одного файла аватарки
export const uploadAvatar = avatarUpload.single('avatar');
