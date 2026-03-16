import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Получение списка всех инструкторов (публичный эндпоинт)
router.get('/list', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url,
        ip.categories,
        ip.experience,
        ip.description,
        ip.schedule,
        ip.rating,
        ip.reviews_count
      FROM users u
      LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
      WHERE u.role = 'instructor' AND u.is_active = true
      ORDER BY ip.rating DESC, u.first_name ASC
    `;

    const [instructors] = await pool.execute<RowDataPacket[]>(query);

    console.log('Raw instructors data:', instructors);

    // Преобразуем categories из JSON в массив с безопасным парсингом
    const formattedInstructors = instructors.map(instructor => {
      let categories = [];
      console.log(`Processing instructor ${instructor.first_name}: categories type = ${typeof instructor.categories}, value = ${JSON.stringify(instructor.categories)}`);
      
      if (instructor.categories) {
        // Если уже массив, используем как есть
        if (Array.isArray(instructor.categories)) {
          categories = instructor.categories;
          console.log(`Categories is already array: ${JSON.stringify(categories)}`);
        } else {
          try {
            // Пытаемся парсить как JSON
            categories = JSON.parse(instructor.categories);
            // Если это не массив, делаем массивом
            if (!Array.isArray(categories)) {
              categories = [categories];
            }
          } catch (error) {
            // Если парсинг не удался, возможно это просто строка
            if (typeof instructor.categories === 'string') {
              categories = [instructor.categories];
            } else {
              categories = [];
            }
          }
        }
      }
      
      console.log(`Instructor ${instructor.first_name}: categories = ${instructor.categories}, parsed = ${JSON.stringify(categories)}`);
      
      // Преобразуем snake_case в camelCase для совместимости с фронтендом
      return {
        id: instructor.id,
        firstName: instructor.first_name,
        lastName: instructor.last_name,
        email: instructor.email,
        phone: instructor.phone,
        avatarUrl: instructor.avatar_url,
        categories,
        experience: instructor.experience || '',
        description: instructor.description || '',
        schedule: instructor.schedule || '',
        rating: instructor.rating || 0,
        reviews_count: instructor.reviews_count || 0,
        created_at: instructor.created_at,
        name: `${instructor.first_name} ${instructor.last_name}`
      };
    });

    res.json({ success: true, data: formattedInstructors });
  } catch (error) {
    console.error('Error fetching instructors list:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении списка инструкторов' });
  }
});

// Получение профиля инструктора
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    // Проверяем, что пользователь является инструктором
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Доступ разрешен только инструкторам' });
    }

    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url,
        ip.categories,
        ip.experience,
        ip.description,
        ip.schedule,
        ip.rating,
        ip.reviews_count
      FROM users u
      LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
      WHERE u.id = ?
    `;

    const [result] = await pool.execute<RowDataPacket[]>(query, [userId]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Профиль инструктора не найден' });
    }

    const profile = result[0];
    
    // Безопасный парсинг categories
    let categories = [];
    if (profile.categories) {
      try {
        categories = JSON.parse(profile.categories);
        if (!Array.isArray(categories)) {
          categories = [categories];
        }
      } catch (error) {
        if (typeof profile.categories === 'string') {
          categories = [profile.categories];
        } else {
          categories = [];
        }
      }
    }
    profile.categories = categories;

    // Преобразуем snake_case в camelCase для совместимости с фронтендом
    const formattedProfile = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      categories: profile.categories,
      experience: profile.experience || '',
      description: profile.description || '',
      schedule: profile.schedule || '',
      rating: profile.rating || 0,
      reviews_count: profile.reviews_count || 0
    };

    res.json({ success: true, data: formattedProfile });
  } catch (error) {
    console.error('Error fetching instructor profile:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении профиля' });
  }
});

// Обновление профиля инструктора
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { categories, experience, description, schedule } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    // Проверяем, что пользователь является инструктором
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Доступ разрешен только инструкторам' });
    }

    // Проверяем, существует ли профиль инструктора
    const [existingProfile] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM instructor_profiles WHERE user_id = ?',
      [userId]
    );

    const categoriesJson = categories ? JSON.stringify(categories) : null;

    if (existingProfile.length === 0) {
      // Создаем новый профиль
      await pool.execute(
        `INSERT INTO instructor_profiles (user_id, categories, experience, description, schedule) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, categoriesJson, experience || '', description || null, schedule || null]
      );
    } else {
      // Обновляем существующий профиль
      await pool.execute(
        `UPDATE instructor_profiles 
         SET categories = ?, experience = ?, description = ?, schedule = ?
         WHERE user_id = ?`,
        [categoriesJson, experience || '', description || null, schedule || null, userId]
      );
    }

    res.json({ success: true, message: 'Профиль успешно обновлен' });
  } catch (error) {
    console.error('Error updating instructor profile:', error);
    res.status(500).json({ success: false, message: 'Ошибка при обновлении профиля' });
  }
});

// Получение курсов инструктора
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    // Проверяем, что пользователь является инструктором или админом
    if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    const query = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM student_courses WHERE course_id = c.id AND is_active = true) as students_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
        ROUND(
          COALESCE(
            (SELECT AVG(progress_percentage) FROM (
              SELECT 
                ROUND(
                  COALESCE(
                    (SELECT COUNT(*) FROM student_lesson_progress slp 
                     JOIN lessons l ON slp.lesson_id = l.id 
                     WHERE l.course_id = c.id AND slp.student_id = sc.student_id AND slp.is_completed = true) * 100.0 /
                    NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = c.id), 0), 0
                  ), 2
                ) as progress_percentage
              FROM student_courses sc
              WHERE sc.course_id = c.id AND sc.is_active = true
            ) as progress_data), 0
          ), 2
        ) as average_progress
      FROM courses c
      WHERE c.instructor_id = ?
      ORDER BY c.created_at DESC
    `;

    const [courses] = await pool.execute<RowDataPacket[]>(query, [userId]);

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении курсов' });
  }
});

// Получение студентов курса
router.get('/courses/:courseId/students', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const courseId = parseInt(req.params.courseId);
    
    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Неверные параметры' });
    }

    // Проверяем, что пользователь является инструктором или админом
    if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, что курс принадлежит инструктору (если не админ)
    if (req.user?.role === 'instructor') {
      const [course] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM courses WHERE id = ? AND instructor_id = ?',
        [courseId, userId]
      );

      if (course.length === 0) {
        return res.status(403).json({ success: false, message: 'Курс не найден или доступ запрещен' });
      }
    }

    const query = `
      SELECT 
        u.*,
        sc.enrollment_date,
        sc.completion_date,
        sc.is_active,
        (SELECT COUNT(*) FROM lessons WHERE course_id = ?) as total_lessons,
        (SELECT COUNT(*) FROM student_lesson_progress slp 
         JOIN lessons l ON slp.lesson_id = l.id 
         WHERE l.course_id = ? AND slp.student_id = u.id AND slp.is_completed = true) as completed_lessons,
        CASE 
          WHEN sc.completion_date IS NOT NULL THEN 'completed'
          WHEN sc.is_active = true THEN 'active'
          ELSE 'paused'
        END as status,
        ROUND(
          COALESCE(
            (SELECT COUNT(*) FROM student_lesson_progress slp 
             JOIN lessons l ON slp.lesson_id = l.id 
             WHERE l.course_id = ? AND slp.student_id = u.id AND slp.is_completed = true) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = ?), 0), 0
          ), 2
        ) as progress,
        (SELECT MAX(slp.completed_at) FROM student_lesson_progress slp 
         JOIN lessons l ON slp.lesson_id = l.id 
         WHERE l.course_id = ? AND slp.student_id = u.id) as last_activity
      FROM student_courses sc
      JOIN users u ON sc.student_id = u.id
      WHERE sc.course_id = ?
      ORDER BY sc.enrollment_date DESC
    `;

    const [students] = await pool.execute<RowDataPacket[]>(
      query, 
      [courseId, courseId, courseId, courseId, courseId, courseId]
    );

    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении студентов' });
  }
});

// Получение детального прогресса студента
router.get('/courses/:courseId/students/:studentId/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const courseId = parseInt(req.params.courseId);
    const studentId = parseInt(req.params.studentId);
    
    if (!userId || !courseId || !studentId) {
      return res.status(400).json({ success: false, message: 'Неверные параметры' });
    }

    // Проверяем, что пользователь является инструктором или админом
    if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, что курс принадлежит инструктору (если не админ)
    if (req.user?.role === 'instructor') {
      const [course] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM courses WHERE id = ? AND instructor_id = ?',
        [courseId, userId]
      );

      if (course.length === 0) {
        return res.status(403).json({ success: false, message: 'Курс не найден или доступ запрещен' });
      }
    }

    // Проверяем, что студент записан на курс
    const [enrollment] = await pool.execute<RowDataPacket[]>(
      'SELECT student_id FROM student_courses WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Студент не записан на этот курс' });
    }

    // Получаем информацию о студенте
    const [student] = await pool.execute<RowDataPacket[]>(
      'SELECT first_name, last_name FROM users WHERE id = ?',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Студент не найден' });
    }

    // Получаем прогресс по урокам
    const query = `
      SELECT 
        l.id,
        l.title,
        l.order_number,
        COALESCE(slp.is_completed, false) as is_completed,
        slp.completed_at
      FROM lessons l
      LEFT JOIN student_lesson_progress slp ON l.id = slp.lesson_id AND slp.student_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_number ASC
    `;

    const [lessons] = await pool.execute<RowDataPacket[]>(query, [studentId, courseId]);

    const result = {
      student_id: studentId,
      student_name: `${student[0].first_name} ${student[0].last_name}`,
      lessons: lessons
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении прогресса студента' });
  }
});

// Оценить инструктора
router.post('/rate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { instructorId, rating } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    if (!instructorId || !rating) {
      return res.status(400).json({ success: false, message: 'Необходимо указать ID инструктора и оценку' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Оценка должна быть от 1 до 5' });
    }

    // Проверяем, что инструктор существует
    const [instructorCheck] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [instructorId, 'instructor']
    );

    if (instructorCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Инструктор не найден' });
    }

    // Добавляем или обновляем рейтинг
    await pool.execute(
      `INSERT INTO instructor_ratings (user_id, instructor_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
      [userId, instructorId, rating]
    );

    // Пересчитываем средний рейтинг
    const [avgResult] = await pool.execute<RowDataPacket[]>(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM instructor_ratings 
       WHERE instructor_id = ?`,
      [instructorId]
    );

    const avgRating = avgResult[0].avg_rating || 0;
    const reviewsCount = avgResult[0].count || 0;

    // Обновляем рейтинг в профиле инструктора
    await pool.execute(
      `UPDATE instructor_profiles 
       SET rating = ?, reviews_count = ? 
       WHERE user_id = ?`,
      [avgRating, reviewsCount, instructorId]
    );

    res.json({ success: true, message: 'Оценка успешно добавлена' });
  } catch (error) {
    console.error('Error rating instructor:', error);
    res.status(500).json({ success: false, message: 'Ошибка при добавлении оценки' });
  }
});

// Получить рейтинг пользователя для инструктора
router.get('/my-rating/:instructorId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { instructorId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    const [rating] = await pool.execute<RowDataPacket[]>(
      'SELECT rating FROM instructor_ratings WHERE user_id = ? AND instructor_id = ?',
      [userId, instructorId]
    );

    res.json({ 
      success: true, 
      data: { rating: rating.length > 0 ? rating[0].rating : null } 
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении оценки' });
  }
});

// Получить детальную информацию об ученике
router.get('/student/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Недостаточно прав' });
    }

    const studentId = req.params.id;

    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.avatar_url,
        u.created_at,
        u.is_active
      FROM users u
      WHERE u.id = ? AND u.role = 'student'
    `;

    const [students] = await pool.execute<RowDataPacket[]>(query, [studentId]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Ученик не найден' });
    }

    const student = students[0];

    // Получаем дополнительную информацию о прогрессе ученика
    // TODO: Добавить запросы для получения прогресса, истории занятий и т.д.

    res.json({ 
      success: true, 
      data: {
        ...student,
        progress: Math.floor(Math.random() * 100), // Временно
        category: "B", // Временно
        enrollments: [], // Временно
        lessons: [] // Временно
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении информации об ученике' });
  }
});

// Назначить занятие
router.post('/schedule-lesson', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Недостаточно прав' });
    }

    const { student_id, date, time, type, description } = req.body;

    if (!student_id || !date || !time || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Обязательные поля: student_id, date, time, type' 
      });
    }

    const insertQuery = `
      INSERT INTO individual_lessons 
      (student_id, instructor_id, date, time, type, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'scheduled', NOW())
    `;

    const [result] = await pool.execute(insertQuery, [
      student_id,
      req.user.id,
      date,
      time,
      type,
      description || null
    ]);

    res.json({ 
      success: true, 
      message: 'Занятие успешно назначено',
      data: { id: (result as any).insertId }
    });
  } catch (error) {
    console.error('Error scheduling lesson:', error);
    res.status(500).json({ success: false, message: 'Ошибка при назначении занятия' });
  }
});

// Получить группы инструктора
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Получаем все группы, к которым привязан инструктор
    const query = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.instructor_id,
        g.created_at,
        COUNT(DISTINCT gs.student_id) as student_count
      FROM \`groups\` g
      LEFT JOIN group_students gs ON g.id = gs.group_id AND gs.status = 'active'
      WHERE g.instructor_id = ?
      GROUP BY g.id, g.name, g.description, g.instructor_id, g.created_at
      ORDER BY g.name ASC
    `;

    const [groups] = await pool.execute<RowDataPacket[]>(query, [instructorId]);

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching instructor groups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении групп' 
    });
  }
});

// Получить всех студентов инструктора
router.get('/all-students', authenticateToken, async (req, res) => {
  try {
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Получаем всех студентов, которые учатся у этого инструктора
    const query = `
      SELECT DISTINCT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url,
        u.created_at,
        u.is_active
      FROM users u
      WHERE u.role = 'student' AND u.is_active = true
      ORDER BY u.first_name ASC, u.last_name ASC
    `;

    const [students] = await pool.execute<RowDataPacket[]>(query);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении списка студентов' 
    });
  }
});

export default router;
