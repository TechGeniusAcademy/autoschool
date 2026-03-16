import { Request, Response } from 'express';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

// Получить всех пользователей
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, avatar_url, role, is_active, email_verified, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    // Преобразуем snake_case в camelCase для совместимости с фронтендом
    const users = (rows as any[]).map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Получить пользователя по ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, avatar_url, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    const users = rows as any[];
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Преобразуем snake_case в camelCase для совместимости с фронтендом
    const user = {
      id: users[0].id,
      firstName: users[0].first_name,
      lastName: users[0].last_name,
      email: users[0].email,
      phone: users[0].phone,
      avatarUrl: users[0].avatar_url,
      role: users[0].role,
      isActive: users[0].is_active,
      emailVerified: users[0].email_verified,
      createdAt: users[0].created_at,
      updatedAt: users[0].updated_at
    };

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Создать пользователя
export const createUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone, password, role, is_active, email_verified, categories, experience, description, schedule } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Хешируем пароль
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const [result] = await pool.execute(
      'INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, password_hash, role || 'student', is_active !== undefined ? is_active : true, email_verified || false]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Если создается инструктор, создаем профиль инструктора
    if (role === 'instructor') {
      await pool.execute(
        'INSERT INTO instructor_profiles (user_id, categories, experience, description, schedule) VALUES (?, ?, ?, ?, ?)',
        [userId, JSON.stringify(categories || []), experience || '', description || '', schedule || '']
      );
    }

    // Получаем созданного пользователя
    const [newUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, avatar_url, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    // Преобразуем snake_case в camelCase для совместимости с фронтендом
    const userRecord = (newUser as any[])[0];
    const user = {
      id: userRecord.id,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      email: userRecord.email,
      phone: userRecord.phone,
      avatarUrl: userRecord.avatar_url,
      role: userRecord.role,
      isActive: userRecord.is_active,
      emailVerified: userRecord.email_verified,
      createdAt: userRecord.created_at,
      updatedAt: userRecord.updated_at
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// Обновить пользователя
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, password, role, is_active, email_verified, categories, experience, description, schedule } = req.body;

    // Проверяем, существует ли пользователь
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if ((existingUsers as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Проверяем уникальность email (кроме текущего пользователя)
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if ((emailCheck as any[]).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (password !== undefined && password !== '') {
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }
    if (email_verified !== undefined) {
      updateFields.push('email_verified = ?');
      updateValues.push(email_verified);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    // Обновляем пользователя
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Если это инструктор, обновляем его профиль
    const [userCheck] = await pool.execute('SELECT role FROM users WHERE id = ?', [id]);
    const userRole = (userCheck as any[])[0]?.role;
    
    if (userRole === 'instructor' && (categories !== undefined || experience !== undefined || description !== undefined || schedule !== undefined)) {
      // Проверяем, есть ли уже профиль инструктора
      const [existingProfile] = await pool.execute('SELECT id FROM instructor_profiles WHERE user_id = ?', [id]);
      
      if ((existingProfile as any[]).length > 0) {
        // Обновляем существующий профиль
        const profileUpdateFields: string[] = [];
        const profileUpdateValues: any[] = [];
        
        if (categories !== undefined) {
          profileUpdateFields.push('categories = ?');
          profileUpdateValues.push(JSON.stringify(categories));
        }
        if (experience !== undefined) {
          profileUpdateFields.push('experience = ?');
          profileUpdateValues.push(experience);
        }
        if (description !== undefined) {
          profileUpdateFields.push('description = ?');
          profileUpdateValues.push(description);
        }
        if (schedule !== undefined) {
          profileUpdateFields.push('schedule = ?');
          profileUpdateValues.push(schedule);
        }
        
        if (profileUpdateFields.length > 0) {
          profileUpdateValues.push(id);
          await pool.execute(
            `UPDATE instructor_profiles SET ${profileUpdateFields.join(', ')} WHERE user_id = ?`,
            profileUpdateValues
          );
        }
      } else {
        // Создаем новый профиль инструктора
        await pool.execute(
          'INSERT INTO instructor_profiles (user_id, categories, experience, description, schedule) VALUES (?, ?, ?, ?, ?)',
          [id, JSON.stringify(categories || []), experience || '', description || '', schedule || '']
        );
      }
    }

    // Получаем обновленного пользователя
    const [updatedUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, avatar_url, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    // Преобразуем snake_case в camelCase для совместимости с фронтендом
    const userRecord = (updatedUser as any[])[0];
    const user = {
      id: userRecord.id,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      email: userRecord.email,
      phone: userRecord.phone,
      avatarUrl: userRecord.avatar_url,
      role: userRecord.role,
      isActive: userRecord.is_active,
      emailVerified: userRecord.email_verified,
      createdAt: userRecord.created_at,
      updatedAt: userRecord.updated_at
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Удалить пользователя
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Получаем данные пользователя для удаления аватара
    const [existingUsers] = await pool.execute(
      'SELECT avatar_url FROM users WHERE id = ?',
      [id]
    );

    const users = existingUsers as any[];
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Удаляем пользователя
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    // Удаляем аватар если он есть
    if (user.avatar_url) {
      const avatarPath = path.join(process.cwd(), 'public', user.avatar_url);
      try {
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (error) {
        console.error('Error deleting avatar file:', error);
      }
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Обновить аватар пользователя (для админки)
export const updateUserAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Проверяем, существует ли пользователь
    const [existingUsers] = await pool.execute(
      'SELECT avatar_url FROM users WHERE id = ?',
      [id]
    );

    const users = existingUsers as any[];
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentAvatar = users[0].avatar_url;

    // Создаем URL для нового аватара
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Обновляем аватар в базе данных
    await pool.execute(
      'UPDATE users SET avatar_url = ? WHERE id = ?',
      [avatarUrl, id]
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
      message: 'Avatar updated successfully',
      data: { avatarUrl }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar'
    });
  }
};

// Удалить аватар пользователя
export const deleteUserAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Получаем текущий аватар пользователя
    const [existingUsers] = await pool.execute(
      'SELECT avatar_url FROM users WHERE id = ?',
      [id]
    );

    const users = existingUsers as any[];
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentAvatar = users[0].avatar_url;

    // Обновляем поле avatar_url на NULL
    await pool.execute(
      'UPDATE users SET avatar_url = NULL WHERE id = ?',
      [id]
    );

    // Удаляем файл аватара если он существует
    if (currentAvatar) {
      const avatarPath = path.join(process.cwd(), 'public', currentAvatar);
      try {
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (error) {
        console.error('Error deleting avatar file:', error);
      }
    }

    res.json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete avatar'
    });
  }
};

// Получить всех студентов
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    console.log('getAllStudents: Запрос на получение всех студентов');
    
    // Сначала посмотрим, какие роли вообще есть в базе
    const [allUsers] = await pool.execute(`
      SELECT id, first_name, last_name, email, role 
      FROM users 
      ORDER BY created_at DESC
    `);
    console.log('getAllStudents: Все пользователи и их роли:', allUsers);
    
    const [rows] = await pool.execute(`
      SELECT id, first_name, last_name, email, phone, is_active, created_at as registration_date, role
      FROM users 
      WHERE role = 'student' 
      ORDER BY created_at DESC
    `);

    console.log('getAllStudents: Найдено студентов с ролью "student":', (rows as any[]).length);
    console.log('getAllStudents: Студенты:', rows);

    res.json({
      success: true,
      students: rows
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
};

// Получить статистику для админской панели
export const getStats = async (req: Request, res: Response) => {
  try {
    // Количество пользователей по ролям
    const [userStats] = await pool.execute(`
      SELECT 
        role, 
        COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    // Общее количество курсов
    const [courseStats] = await pool.execute(`
      SELECT COUNT(*) as total_courses FROM courses
    `);

    // Количество активных занятий
    const [lessonStats] = await pool.execute(`
      SELECT COUNT(*) as active_lessons 
      FROM individual_lessons 
      WHERE status = 'scheduled'
    `);

    // Количество записей за последние 30 дней
    const [recentSignups] = await pool.execute(`
      SELECT COUNT(*) as recent_signups 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const stats = {
      users: userStats,
      totalCourses: (courseStats as any[])[0]?.total_courses || 0,
      activeLessons: (lessonStats as any[])[0]?.active_lessons || 0,
      recentSignups: (recentSignups as any[])[0]?.recent_signups || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Получить все группы
export const getGroups = async (req: Request, res: Response) => {
  try {
    // Проверяем существование таблицы groups
    const [tableExists] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'groups'
    `);

    const exists = (tableExists as any[])[0]?.count > 0;

    if (!exists) {
      // Если таблицы нет, возвращаем пустой массив
      return res.json({
        success: true,
        data: []
      });
    }

    const [rows] = await pool.execute(`
      SELECT 
        g.*,
        COUNT(gs.student_id) as student_count
      FROM \`groups\` g
      LEFT JOIN group_students gs ON g.id = gs.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Get groups error:', error);
    // Возвращаем пустой массив в случае ошибки
    res.json({
      success: true,
      data: []
    });
  }
};

// Создать группу
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, course_id, instructor_id, start_date, end_date, max_students, description } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO `groups` (name, course_id, instructor_id, start_date, end_date, max_students, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, course_id, instructor_id, start_date, end_date, max_students, description]
    );

    const insertResult = result as any;
    const groupId = insertResult.insertId;

    // Получаем созданную группу
    const [newGroup] = await pool.execute(
      'SELECT * FROM `groups` WHERE id = ?',
      [groupId]
    );

    res.status(201).json({
      success: true,
      message: 'Группа успешно создана',
      data: { group: (newGroup as any[])[0] }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    });
  }
};

// Обновить группу
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, course_id, instructor_id, start_date, end_date, max_students, description } = req.body;

    // Проверяем, существует ли группа
    const [existingGroups] = await pool.execute(
      'SELECT id FROM `groups` WHERE id = ?',
      [id]
    );

    if ((existingGroups as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Подготавливаем данные для обновления
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (course_id !== undefined) {
      updateFields.push('course_id = ?');
      updateValues.push(course_id);
    }
    if (instructor_id !== undefined) {
      updateFields.push('instructor_id = ?');
      updateValues.push(instructor_id);
    }
    if (start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(start_date);
    }
    if (end_date !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(end_date);
    }
    if (max_students !== undefined) {
      updateFields.push('max_students = ?');
      updateValues.push(max_students);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    // Обновляем группу
    await pool.execute(
      `UPDATE \`groups\` SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Получаем обновленную группу
    const [updatedGroup] = await pool.execute(
      'SELECT * FROM `groups` WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group: (updatedGroup as any[])[0] }
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
};

// Удалить группу
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли группа
    const [existingGroups] = await pool.execute(
      'SELECT id FROM `groups` WHERE id = ?',
      [id]
    );

    if ((existingGroups as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Удаляем связи со студентами
    await pool.execute('DELETE FROM group_students WHERE group_id = ?', [id]);

    // Удаляем группу
    await pool.execute('DELETE FROM `groups` WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group'
    });
  }
};

// Получить детали группы со студентами
export const getGroupDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Получаем группу
    const [groups] = await pool.execute(`
      SELECT 
        g.*,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name
      FROM \`groups\` g
      LEFT JOIN users u ON g.instructor_id = u.id
      WHERE g.id = ?
    `, [id]);

    const group = (groups as any[])[0];
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Получаем студентов группы
    const [students] = await pool.execute(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        gs.enrolled_at,
        gs.status
      FROM group_students gs
      JOIN users u ON gs.student_id = u.id
      WHERE gs.group_id = ? AND gs.status = 'active'
      ORDER BY gs.enrolled_at
    `, [id]);

    res.json({
      success: true,
      data: {
        ...group,
        students: students
      }
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group details'
    });
  }
};

// Добавить студента в группу
export const addStudentToGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // group_id
    const { student_id } = req.body;

    console.log('🔄 Adding student to group:', { group_id: id, student_id });

    // Проверяем, существует ли группа
    const [groups] = await pool.execute(`
      SELECT id, max_students FROM \`groups\` WHERE id = ?
    `, [id]);

    const group = (groups as any[])[0];
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Группа не найдена'
      });
    }

    // Проверяем, существует ли студент
    const [students] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND role = "student"',
      [student_id]
    );

    if ((students as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Студент не найден'
      });
    }

    // Проверяем, не состоит ли уже студент в этой группе
    const [existing] = await pool.execute(`
      SELECT id FROM group_students 
      WHERE group_id = ? AND student_id = ? AND status = 'active'
    `, [id, student_id]);

    if ((existing as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Студент уже состоит в этой группе'
      });
    }

    // Проверяем лимит студентов в группе
    const [currentCount] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM group_students 
      WHERE group_id = ? AND status = 'active'
    `, [id]);

    const currentStudentCount = (currentCount as any[])[0].count;
    if (group.max_students && currentStudentCount >= group.max_students) {
      return res.status(400).json({
        success: false,
        message: `Достигнуто максимальное количество студентов в группе (${group.max_students})`
      });
    }

    // Добавляем студента в группу
    await pool.execute(`
      INSERT INTO group_students (group_id, student_id, status, enrolled_at)
      VALUES (?, ?, 'active', NOW())
    `, [id, student_id]);

    console.log('✅ Student successfully added to group');

    res.json({
      success: true,
      message: 'Студент успешно добавлен в группу'
    });

  } catch (error) {
    console.error('Add student to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении студента в группу'
    });
  }
};

// Удалить студента из группы
export const removeStudentFromGroup = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params; // group_id, student_id

    console.log('🔄 Removing student from group:', { group_id: id, student_id: studentId });

    // Проверяем, состоит ли студент в группе
    const [existing] = await pool.execute(`
      SELECT id FROM group_students 
      WHERE group_id = ? AND student_id = ? AND status = 'active'
    `, [id, studentId]);

    if ((existing as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Студент не найден в этой группе'
      });
    }

    // Удаляем студента из группы (помечаем как неактивного)
    await pool.execute(`
      UPDATE group_students 
      SET status = 'dropped', updated_at = NOW()
      WHERE group_id = ? AND student_id = ?
    `, [id, studentId]);

    console.log('✅ Student successfully removed from group');

    res.json({
      success: true,
      message: 'Студент успешно удален из группы'
    });

  } catch (error) {
    console.error('Remove student from group error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении студента из группы'
    });
  }
};
