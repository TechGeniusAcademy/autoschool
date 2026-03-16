import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { CreateUserData, LoginData, User } from '../models/User';

// Регистрация нового пользователя
export const register = async (req: Request, res: Response) => {
  try {
    console.log("Registration request body:", req.body);
    
    // Проверяем валидацию
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, phone, password } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    const users = existingUsers as any[];
    if (users.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Создаем нового пользователя
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, passwordHash, 'student']
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Получаем созданного пользователя
    const [newUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const userArray = newUser as User[];
    const user = userArray[0];

    // Генерируем токен
    const token = generateToken(user);

    // Создаем сессию
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await pool.execute(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, require('bcryptjs').hashSync(token, 10), expiresAt]
    );

    // Логируем попытку входа
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    await pool.execute(
      'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
      [email, clientIp, true]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatar_url
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Вход пользователя
export const login = async (req: Request, res: Response) => {
  try {
    // Проверяем валидацию
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, rememberMe }: LoginData = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Найти пользователя по email
    const [users] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, password_hash, avatar_url, role, is_active FROM users WHERE email = ?',
      [email]
    );

    const userArray = users as User[];
    
    if (userArray.length === 0) {
      // Логируем неудачную попытку
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, clientIp, false]
      );

      return res.status(401).json({
        success: false,
        message: 'Неправильный email или пароль'
      });
    }

    const user = userArray[0];

    // Проверяем, активен ли аккаунт
    if (!user.is_active) {
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, clientIp, false]
      );

      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Логируем неудачную попытку
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, clientIp, false]
      );

      return res.status(401).json({
        success: false,
        message: 'Неправильный email или пароль'
      });
    }

    // Генерируем токен
    const token = generateToken(user);

    // Создаем сессию
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7)); // 30 дней если "запомнить", иначе 7

    await pool.execute(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, require('bcryptjs').hashSync(token, 10), expiresAt]
    );

    // Логируем успешную попытку
    await pool.execute(
      'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
      [email, clientIp, true]
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatar_url
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Выход пользователя
export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Деактивируем все сессии пользователя
    await pool.execute(
      'UPDATE user_sessions SET is_active = false WHERE user_id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Получение информации о текущем пользователе
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          avatarUrl: user.avatar_url
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Проверка валидности токена
export const verifyTokenEndpoint = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatar_url
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { firstName, lastName, email, phone } = req.body;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Подготавливаем объект для обновления только с переданными полями
    const updateFields: any = {};
    const updateValues: any[] = [];
    let updateQuery = 'UPDATE users SET ';
    
    if (firstName !== undefined) {
      updateFields.first_name = firstName;
    }
    
    if (lastName !== undefined) {
      updateFields.last_name = lastName;
    }
    
    if (email !== undefined) {
      // Проверяем уникальность email (если он изменился)
      if (email !== user.email) {
        const [existingUsers] = await pool.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, user.id]
        ) as any[];

        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Пользователь с таким email уже существует'
          });
        }
      }
      updateFields.email = email;
    }
    
    if (phone !== undefined) {
      updateFields.phone = phone;
    }

    // Проверяем, есть ли поля для обновления
    const fieldNames = Object.keys(updateFields);
    if (fieldNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Нет данных для обновления'
      });
    }

    // Строим динамический SQL запрос
    const setClauses = fieldNames.map(field => `${field} = ?`);
    updateQuery += setClauses.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    // Добавляем значения для параметров
    updateValues.push(...Object.values(updateFields), user.id);

    // Выполняем обновление
    await pool.execute(updateQuery, updateValues);

    // Получаем обновленные данные пользователя
    const [updatedUsers] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, avatar_url, role FROM users WHERE id = ?',
      [user.id]
    ) as any[];

    const updatedUser = updatedUsers[0];

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          role: updatedUser.role,
          avatarUrl: updatedUser.avatar_url
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Изменение пароля
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Текущий пароль и новый пароль обязательны'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Новый пароль должен содержать минимум 6 символов'
      });
    }

    // Получаем текущий хеш пароля пользователя
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const userArray = users as any[];
    if (userArray.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const user = userArray[0];

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Неверный текущий пароль'
      });
    }

    // Хешируем новый пароль
    const newPasswordHash = await hashPassword(newPassword);

    // Обновляем пароль в базе данных
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Удаляем все активные сессии пользователя (кроме текущей)
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    if (currentToken) {
      await pool.execute(
        'DELETE FROM user_sessions WHERE user_id = ? AND token_hash != ?',
        [userId, require('bcryptjs').hashSync(currentToken, 10)]
      );
    }

    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};
