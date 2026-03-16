import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Интерфейсы
interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  featured_image?: string;
  price: number;
  instructor_id: number;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  prerequisites?: string;
  learning_outcomes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  lesson_type: 'video' | 'text' | 'live_stream' | 'test';
  video_url?: string;
  video_duration?: number;
  live_stream_date?: string;
  live_stream_url?: string;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
}

// Вспомогательная функция для создания slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Создание курса
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      short_description,
      featured_image,
      price = 0,
      category,
      difficulty = 'beginner',
      duration_weeks = 4,
      prerequisites,
      learning_outcomes,
      instructor_id: requestInstructorId
    } = req.body;

    const user = (req as any).user;
    
    // Если пользователь админ и передан instructor_id, используем его
    // Иначе используем ID текущего пользователя
    let instructor_id: number;
    if (user.role === 'admin' && requestInstructorId) {
      instructor_id = requestInstructorId;
    } else {
      instructor_id = user.id;
    }

    let slug = req.body.slug || generateSlug(title);

    // Проверяем уникальность slug
    const [existingCourse] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM courses WHERE slug = ?',
      [slug]
    );

    if (existingCourse.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO courses (
        title, slug, description, short_description, featured_image,
        price, instructor_id, category, difficulty, duration_weeks, prerequisites, learning_outcomes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, short_description, featured_image, price, instructor_id, category, difficulty, duration_weeks, prerequisites, learning_outcomes]
    );

    // Получаем созданный курс
    const [newCourse] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, 
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Курс создан успешно',
      data: newCourse[0]
    });
  } catch (error) {
    console.error('Ошибка при создании курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение всех курсов
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const price = req.query.price as string; // 'free' или 'paid'
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
             c.instructor_id,
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
             u.email as instructor_email,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
             (SELECT COUNT(*) FROM student_courses WHERE course_id = c.id AND is_active = true) as students_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(c.title LIKE ? OR c.description LIKE ? OR c.short_description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }

    if (difficulty) {
      conditions.push('c.difficulty = ?');
      params.push(difficulty);
    }

    if (price) {
      if (price === 'free') {
        conditions.push('(c.price = 0 OR c.price IS NULL)');
      } else if (price === 'paid') {
        conditions.push('c.price > 0');
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log('getAllCourses - Query:', query);
    console.log('getAllCourses - Params count:', params.length);
    console.log('getAllCourses - Params:', params);

    const [courses] = await pool.execute<RowDataPacket[]>(query, params);

    // Подсчет общего количества курсов
    let countQuery = 'SELECT COUNT(*) as total FROM courses c';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      // Копируем параметры кроме limit и offset
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (category) {
        countParams.push(category);
      }
      if (difficulty) {
        countParams.push(difficulty);
      }
      // Параметр price не добавляем, так как он использует прямые условия
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение курса по ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [courses] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, 
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
              u.email as instructor_email
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (courses.length === 0) {
      res.status(404).json({ success: false, message: 'Курс не найден' });
      return;
    }

    // Получаем уроки курса
    const [lessons] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
      [id]
    );

    res.json({
      success: true,
      course: {
        ...courses[0],
        lessons
      }
    });
  } catch (error) {
    console.error('Ошибка при получении курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Публичное получение курса по slug
export const getPublicCourseBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    console.log('Запрошен курс с slug:', slug);

    const [courses] = await pool.execute<RowDataPacket[]>(
      `SELECT c.id, c.title, c.slug, c.short_description, c.description, c.featured_image, 
              c.price, c.category, c.difficulty, c.duration_weeks, c.created_at, c.prerequisites,
              c.learning_outcomes, c.is_active,
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
              u.avatar_url as instructor_avatar,
              (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
              (SELECT COUNT(*) FROM student_courses WHERE course_id = c.id AND is_active = true) as students_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.slug = ? AND c.is_active = true`,
      [slug]
    );

    console.log('Найдено курсов:', courses.length);

    if (courses.length === 0) {
      res.status(404).json({ success: false, message: 'Запрашиваемый курс не существует или был удален' });
      return;
    }

    // Получаем бесплатные уроки курса (превью)
    const [lessons] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, description, lesson_type, video_duration, order_index, is_preview
       FROM lessons 
       WHERE course_id = ? AND is_preview = true 
       ORDER BY order_index ASC`,
      [courses[0].id]
    );

    // Получаем все уроки для подсчета (без содержимого)
    const [allLessons] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, description, lesson_type, video_duration, order_index, is_preview
       FROM lessons 
       WHERE course_id = ? 
       ORDER BY order_index ASC`,
      [courses[0].id]
    );

    console.log('Отправляем данные курса:', courses[0].title);

    res.json({
      success: true,
      data: {
        ...courses[0],
        preview_lessons: lessons,
        all_lessons: allLessons
      }
    });
  } catch (error) {
    console.error('Ошибка при получении публичного курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Обновление курса
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      short_description,
      featured_image,
      price,
      category,
      difficulty,
      duration_weeks,
      prerequisites,
      learning_outcomes,
      is_active,
      instructor_id: requestInstructorId
    } = req.body;

    const user = (req as any).user;
    let instructor_id: number | undefined;
    
    // Если пользователь админ и передан instructor_id, используем его
    if (user.role === 'admin' && requestInstructorId) {
      instructor_id = requestInstructorId;
    }

    let slug = req.body.slug;
    if (!slug && title) {
      slug = generateSlug(title);
    }

    // Проверяем уникальность slug (исключая текущий курс)
    if (slug) {
      const [existingCourse] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM courses WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (existingCourse.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Обновляем курс с instructor_id если он предоставлен
    if (instructor_id) {
      await pool.execute(
        `UPDATE courses SET 
          title = ?, slug = ?, description = ?, short_description = ?,
          featured_image = ?, price = ?, instructor_id = ?, category = ?, difficulty = ?,
          duration_weeks = ?, prerequisites = ?, learning_outcomes = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, slug, description, short_description, featured_image, price, instructor_id, category, difficulty, duration_weeks, prerequisites, learning_outcomes, is_active, id]
      );
    } else {
      await pool.execute(
        `UPDATE courses SET 
          title = ?, slug = ?, description = ?, short_description = ?,
          featured_image = ?, price = ?, category = ?, difficulty = ?,
          duration_weeks = ?, prerequisites = ?, learning_outcomes = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, slug, description, short_description, featured_image, price, category, difficulty, duration_weeks, prerequisites, learning_outcomes, is_active, id]
      );
    }

    // Получаем обновленный курс
    const [updatedCourse] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, 
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Курс обновлен успешно',
      data: updatedCourse[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Удаление курса
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Проверяем, есть ли назначенные студенты
    const [assignedStudents] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM student_courses WHERE course_id = ? AND is_active = true',
      [id]
    );

    if (assignedStudents[0].count > 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Нельзя удалить курс, к которому назначены студенты' 
      });
      return;
    }

    await pool.execute('DELETE FROM courses WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Курс удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Назначение курса студенту
export const assignCourseToStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, studentId } = req.body;
    const assignedBy = (req as any).user.id;

    // Проверяем существование курса и студента
    const [course] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM courses WHERE id = ? AND is_active = true',
      [courseId]
    );

    const [student] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = "student"',
      [studentId]
    );

    if (course.length === 0) {
      res.status(404).json({ success: false, message: 'Курс не найден' });
      return;
    }

    if (student.length === 0) {
      res.status(404).json({ success: false, message: 'Студент не найден' });
      return;
    }

    // Проверяем, не назначен ли уже курс
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      res.status(400).json({ success: false, message: 'Курс уже назначен этому студенту' });
      return;
    }

    await pool.execute(
      'INSERT INTO student_courses (student_id, course_id, assigned_by) VALUES (?, ?, ?)',
      [studentId, courseId, assignedBy]
    );

    res.json({
      success: true,
      message: 'Курс назначен студенту успешно'
    });
  } catch (error) {
    console.error('Ошибка при назначении курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение курсов студента
export const getStudentCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;

    const [courses] = await pool.execute<RowDataPacket[]>(
      `SELECT c.*, sc.enrolled_at, sc.started_at, sc.completed_at, sc.progress_percentage,
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
              (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
              (SELECT COUNT(*) FROM lesson_progress lp 
               WHERE lp.course_id = c.id AND lp.student_id = sc.student_id AND lp.status = 'completed') as completed_lessons
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE sc.student_id = ? AND sc.is_active = true
       ORDER BY sc.enrolled_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Ошибка при получении курсов студента:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Публичное получение курсов (без аутентификации)
export const getPublicCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const price = req.query.price as string; // 'free' или 'paid'
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.id, c.title, c.slug, c.short_description, c.featured_image, c.price, c.category, 
             c.difficulty, c.duration_weeks, c.created_at,
             CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
             (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
             (SELECT COUNT(*) FROM student_courses WHERE course_id = c.id AND is_active = true) as students_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_active = true
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(c.title LIKE ? OR c.description LIKE ? OR c.short_description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }

    if (difficulty) {
      conditions.push('c.difficulty = ?');
      params.push(difficulty);
    }

    if (price) {
      if (price === 'free') {
        conditions.push('(c.price = 0 OR c.price IS NULL)');
      } else if (price === 'paid') {
        conditions.push('c.price > 0');
      }
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ` ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [courses] = await pool.execute<RowDataPacket[]>(query, params);

    // Подсчет общего количества активных курсов
    let countQuery = 'SELECT COUNT(*) as total FROM courses c WHERE c.is_active = true';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
      // Копируем только параметры фильтров (без limit и offset)
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (category) {
        countParams.push(category);
      }
      if (difficulty) {
        countParams.push(difficulty);
      }
      // Параметр price не добавляем, так как он использует прямые условия
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении публичных курсов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение студентов курса
export const getCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Получаем всех студентов, назначенных на курс
    const [students] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         u.id, 
         u.first_name, 
         u.last_name, 
         u.email, 
         sc.enrolled_at as enrollment_date,
         sc.is_active
       FROM student_courses sc
       JOIN users u ON sc.student_id = u.id
       WHERE sc.course_id = ? AND sc.is_active = true
       ORDER BY sc.enrolled_at DESC`,
      [id]
    );

    res.json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Ошибка при получении студентов курса:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Назначение нескольких студентов на курс
export const assignStudentsToCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Assigning students to course - Request received');
    const { id } = req.params;
    const { student_ids } = req.body;
    const assignedBy = (req as any).user.id;

    console.log('📋 Assignment details:', {
      courseId: id,
      studentIds: student_ids,
      assignedBy: assignedBy
    });

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      console.log('❌ No student IDs provided');
      res.status(400).json({ success: false, message: 'Не указаны ID студентов' });
      return;
    }

    // Проверяем существование курса
    console.log('🔍 Checking if course exists...');
    const [course] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM courses WHERE id = ? AND is_active = true',
      [id]
    );

    if (course.length === 0) {
      console.log('❌ Course not found');
      res.status(404).json({ success: false, message: 'Курс не найден' });
      return;
    }

    console.log('✅ Course found, proceeding with student assignments...');

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const studentId of student_ids) {
      try {
        console.log(`🔍 Processing student ID: ${studentId}`);
        
        // Проверяем существование студента
        const [student] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM users WHERE id = ? AND role = "student" AND is_active = true',
          [studentId]
        );

        if (student.length === 0) {
          console.log(`❌ Student ${studentId} not found or not active`);
          errors.push(`Студент с ID ${studentId} не найден`);
          errorCount++;
          continue;
        }

        console.log(`✅ Student ${studentId} found`);

        // Проверяем, не назначен ли уже курс
        const [existing] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
          [studentId, id]
        );

        if (existing.length > 0) {
          console.log(`⚠️ Student ${studentId} already assigned to course`);
          errors.push(`Студент с ID ${studentId} уже записан на курс`);
          errorCount++;
          continue;
        }

        console.log(`➕ Assigning student ${studentId} to course ${id}`);

        // Назначаем курс студенту
        await pool.execute(
          'INSERT INTO student_courses (student_id, course_id, assigned_by) VALUES (?, ?, ?)',
          [studentId, id, assignedBy]
        );

        console.log(`✅ Student ${studentId} successfully assigned`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error assigning student ${studentId}:`, error);
        errors.push(`Ошибка при назначении студента с ID ${studentId}`);
        errorCount++;
      }
    }

    console.log('📊 Assignment results:', {
      successCount,
      errorCount,
      errors
    });

    res.json({
      success: successCount > 0,
      message: `Успешно назначено: ${successCount}, ошибок: ${errorCount}`,
      details: {
        success_count: successCount,
        error_count: errorCount,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Ошибка при назначении студентов на курс:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Отчисление студента с курса
export const unassignStudentFromCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, studentId } = req.params;

    // Проверяем существование записи
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND is_active = true',
      [studentId, id]
    );

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Студент не записан на этот курс' });
      return;
    }

    // Деактивируем запись (мягкое удаление)
    await pool.execute(
      'UPDATE student_courses SET is_active = false WHERE student_id = ? AND course_id = ?',
      [studentId, id]
    );

    res.json({
      success: true,
      message: 'Студент отчислен с курса'
    });
  } catch (error) {
    console.error('Ошибка при отчислении студента:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// ===== МЕТОДЫ ДЛЯ РАБОТЫ С УРОКАМИ =====

// Получить все уроки курса
export const getLessonsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const [lessons] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        l.*,
        CASE WHEN lt.id IS NOT NULL THEN true ELSE false END as has_test
      FROM lessons l
      LEFT JOIN lesson_tests lt ON l.id = lt.lesson_id
      WHERE l.course_id = ?
      ORDER BY l.order_index ASC
    `, [courseId]);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Ошибка при получении уроков:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Создать новый урок
export const createLesson = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      content,
      lesson_type,
      video_url,
      video_duration,
      live_stream_date,
      live_stream_url,
      order_index,
      is_preview
    } = req.body;

    // Валидация обязательных полей
    if (!title || !lesson_type) {
      return res.status(400).json({
        success: false,
        message: 'Название урока и тип обязательны'
      });
    }

    // Проверяем, что курс существует
    const [course] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Курс не найден'
      });
    }

    // Если order_index не указан, ставим в конец
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const [maxOrder] = await pool.execute<RowDataPacket[]>(
        'SELECT MAX(order_index) as max_order FROM lessons WHERE course_id = ?',
        [courseId]
      );
      finalOrderIndex = (maxOrder[0]?.max_order || 0) + 1;
    }

    // Создаем урок
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO lessons (
        course_id, title, description, content, lesson_type, 
        video_url, video_duration, live_stream_date, live_stream_url, 
        order_index, is_preview
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      courseId,
      title,
      description || null,
      content || null,
      lesson_type,
      video_url || null,
      video_duration || 0,
      live_stream_date || null,
      live_stream_url || null,
      finalOrderIndex,
      is_preview || false
    ]);

    res.status(201).json({
      success: true,
      message: 'Урок успешно создан',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Ошибка при создании урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Обновить урок
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      description,
      content,
      lesson_type,
      video_url,
      video_duration,
      live_stream_date,
      live_stream_url,
      order_index,
      is_preview
    } = req.body;

    // Проверяем, что урок существует
    const [lesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Урок не найден'
      });
    }

    // Обновляем урок
    await pool.execute(`
      UPDATE lessons SET 
        title = ?, description = ?, content = ?, lesson_type = ?,
        video_url = ?, video_duration = ?, live_stream_date = ?, live_stream_url = ?,
        order_index = ?, is_preview = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      description,
      content,
      lesson_type,
      video_url,
      video_duration,
      live_stream_date,
      live_stream_url,
      order_index,
      is_preview,
      lessonId
    ]);

    res.json({
      success: true,
      message: 'Урок успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка при обновлении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Удалить урок
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Проверяем, что урок существует
    const [lesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id, course_id FROM lessons WHERE id = ?',
      [lessonId]
    );

    if (lesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Урок не найден'
      });
    }

    // Удаляем урок (тесты и прогресс удалятся автоматически по CASCADE)
    await pool.execute('DELETE FROM lessons WHERE id = ?', [lessonId]);

    res.json({
      success: true,
      message: 'Урок успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Изменить порядок уроков
export const reorderLessons = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonOrders } = req.body; // Массив объектов [{id: number, order_index: number}]

    if (!Array.isArray(lessonOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных'
      });
    }

    // Обновляем порядок для каждого урока
    for (const lessonOrder of lessonOrders) {
      await pool.execute(
        'UPDATE lessons SET order_index = ? WHERE id = ? AND course_id = ?',
        [lessonOrder.order_index, lessonOrder.id, courseId]
      );
    }

    res.json({
      success: true,
      message: 'Порядок уроков успешно изменен'
    });
  } catch (error) {
    console.error('Ошибка при изменении порядка уроков:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};
