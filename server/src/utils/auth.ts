import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Хеширование пароля
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Проверка пароля
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Генерация JWT токена
export const generateToken = (user: Partial<User>): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  };

  const options: SignOptions = { 
    expiresIn: '7d'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Верификация JWT токена
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

// Извлечение токена из заголовка Authorization
export const extractTokenFromHeader = (authHeader: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

// Генерация хеша токена для хранения в БД
export const generateTokenHash = (token: string): string => {
  return bcrypt.hashSync(token, 10);
};
