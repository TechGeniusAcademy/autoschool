import { Request, Response } from 'express';
import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

// Загрузка аватарки
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Получаем текущий аватар пользователя для удаления старого файла
    const [userRows] = await pool.execute(
      'SELECT avatar_url FROM users WHERE id = ?',
      [user.id]
    );

    const users = userRows as any[];
    const currentAvatar = users[0]?.avatar_url;

    // Создаем URL для нового аватара
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Обновляем аватар в базе данных
    await pool.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, user.id]
    );

    // Удаляем старый файл аватара если он существует
    if (currentAvatar && currentAvatar !== avatarUrl) {
      const oldFilePath = path.join(process.cwd(), 'public', currentAvatar);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar_url: avatarUrl
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Удаляем загруженный файл в случае ошибки
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Удаление аватарки
export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Получаем текущий аватар пользователя
    const [userRows] = await pool.execute(
      'SELECT avatar_url FROM users WHERE id = ?',
      [user.id]
    );

    const users = userRows as any[];
    const currentAvatar = users[0]?.avatar_url;

    if (!currentAvatar) {
      return res.status(404).json({
        success: false,
        message: 'No avatar to delete'
      });
    }

    // Удаляем аватар из базы данных
    await pool.execute(
      'UPDATE users SET avatar_url = NULL WHERE id = ?',
      [user.id]
    );

    // Удаляем файл аватара
    const filePath = path.join(process.cwd(), 'public', currentAvatar);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting avatar file:', error);
    }

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
