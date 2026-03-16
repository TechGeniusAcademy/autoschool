import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { pool } from '../config/database';

// Расширение типа Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware для проверки аутентификации
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (!token || token === 'null') {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Верифицируем токен
    const decoded = verifyToken(token);

    // Проверяем, существует ли пользователь и активен ли он
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, avatar_url, role, is_active FROM users WHERE id = ? AND is_active = true',
      [decoded.id]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Добавляем пользователя к объекту запроса
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware для опциональной аутентификации (не блокирует если токена нет)
export const optionalAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (!token || token === 'null') {
      // Токена нет, но это нормально - продолжаем без пользователя
      req.user = undefined;
      return next();
    }

    try {
      // Верифицируем токен
      const decoded = verifyToken(token);

      // Проверяем, существует ли пользователь и активен ли он
      const [rows] = await pool.execute(
        'SELECT id, first_name, last_name, email, avatar_url, role, is_active FROM users WHERE id = ? AND is_active = true',
        [decoded.id]
      );

      const users = rows as any[];
      if (users.length > 0) {
        // Добавляем пользователя к объекту запроса
        req.user = users[0];
      } else {
        req.user = undefined;
      }
    } catch (error) {
      // Токен невалиден, но это нормально - продолжаем без пользователя
      req.user = undefined;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = undefined;
    next();
  }
};

// Middleware для проверки роли пользователя
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware для проверки, что пользователь студент
export const requireStudent = requireRole(['student']);

// Middleware для проверки, что пользователь инструктор или админ
export const requireInstructor = requireRole(['instructor', 'admin']);

// Middleware для проверки, что пользователь админ
export const requireAdmin = requireRole(['admin']);
