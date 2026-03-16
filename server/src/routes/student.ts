import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Получение данных для дашборда студента
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('Student dashboard route called for user:', req.user);
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('Student dashboard: No user ID found');
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    // Проверяем, что пользователь является студентом
    if (req.user?.role !== 'student') {
      console.log('Student dashboard: User is not a student, role:', req.user?.role);
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Получаем основную статистику курсов студента
    const [courseStats] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT sc.course_id) as total_courses,
        COUNT(DISTINCT CASE WHEN sc.is_active = 1 THEN sc.course_id END) as active_courses,
        COUNT(DISTINCT CASE WHEN sc.completion_date IS NOT NULL THEN sc.course_id END) as completed_courses,
        AVG(
          COALESCE(
            (SELECT COUNT(*) FROM student_lesson_progress slp 
             JOIN lessons l ON slp.lesson_id = l.id 
             WHERE l.course_id = sc.course_id AND slp.student_id = sc.student_id AND slp.is_completed = true) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = sc.course_id), 0), 0
          )
        ) as average_progress
      FROM student_courses sc
      WHERE sc.student_id = ?
    `, [userId]);

    // Получаем ближайшее занятие
    const [upcomingLesson] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        'individual' as lesson_source,
        il.id,
        il.lesson_date as date,
        il.start_time,
        il.end_time,
        il.subject as title,
        il.lesson_type as type,
        il.location,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM individual_lessons il
      JOIN users u ON il.instructor_id = u.id
      WHERE il.student_id = ? 
      AND CONCAT(il.lesson_date, ' ', il.start_time) > NOW()
      AND il.status = 'scheduled'
      
      UNION ALL
      
      SELECT 
        'group' as lesson_source,
        s.id,
        CASE s.day_of_week
          WHEN 'monday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 0 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'tuesday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 1 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'wednesday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 2 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'thursday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 3 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'friday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 4 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'saturday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 5 - WEEKDAY(CURDATE())) % 7 DAY)
          WHEN 'sunday' THEN DATE_ADD(CURDATE(), INTERVAL (7 + 6 - WEEKDAY(CURDATE())) % 7 DAY)
        END as date,
        s.start_time,
        s.end_time,
        CONCAT(g.name, ' - ', c.title) as title,
        s.lesson_type as type,
        s.classroom as location,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN group_students gs ON g.id = gs.group_id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE gs.student_id = ? AND gs.status = 'active' AND s.is_active = true
      
      ORDER BY date, start_time
      LIMIT 1
    `, [userId, userId]);

    const stats = courseStats[0] || {
      total_courses: 0,
      active_courses: 0,
      completed_courses: 0,
      average_progress: 0
    };

    const nextLesson = upcomingLesson[0] || null;

    res.json({
      success: true,
      data: {
        stats: {
          totalCourses: stats.total_courses,
          activeCourses: stats.active_courses,
          completedCourses: stats.completed_courses,
          averageProgress: Math.round(stats.average_progress || 0)
        },
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          date: nextLesson.date,
          startTime: nextLesson.start_time,
          endTime: nextLesson.end_time,
          type: nextLesson.type,
          location: nextLesson.location,
          instructorName: nextLesson.instructor_name,
          source: nextLesson.lesson_source
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении данных дашборда' });
  }
});

// Получение предстоящих занятий
router.get('/upcoming-lessons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Получаем предстоящие индивидуальные занятия
    const [individualLessons] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        'individual' as lesson_source,
        il.id,
        il.lesson_date as date,
        il.start_time,
        il.end_time,
        il.subject as title,
        il.lesson_type as type,
        il.location,
        il.status,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM individual_lessons il
      JOIN users u ON il.instructor_id = u.id
      WHERE il.student_id = ? 
      AND il.lesson_date >= CURDATE()
      AND il.status IN ('scheduled')
      ORDER BY il.lesson_date, il.start_time
      LIMIT 10
    `, [userId]);

    // Получаем расписание группы на ближайшие дни
    const [groupSchedule] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        'group' as lesson_source,
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        CONCAT(g.name, ' - ', c.title) as title,
        s.lesson_type as type,
        s.classroom as location,
        'upcoming' as status,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN group_students gs ON g.id = gs.group_id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE gs.student_id = ? AND gs.status = 'active' AND s.is_active = true
      ORDER BY 
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, [userId]);

    // Преобразуем расписание группы в конкретные даты на ближайшие 2 недели
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const upcomingGroupLessons = [];
    const dayMap: {[key: string]: number} = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 
      'friday': 5, 'saturday': 6, 'sunday': 0
    };

    for (const schedule of groupSchedule) {
      const targetDay = dayMap[schedule.day_of_week];
      let currentDate = new Date(today);
      
      // Найдем следующее вхождение этого дня недели
      while (currentDate.getDay() !== targetDay || currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Добавляем занятия на ближайшие 2 недели
      while (currentDate <= twoWeeksFromNow) {
        upcomingGroupLessons.push({
          ...schedule,
          date: currentDate.toISOString().split('T')[0]
        });
        currentDate.setDate(currentDate.getDate() + 7); // Следующая неделя
      }
    }

    // Объединяем и сортируем все занятия
    const allLessons = [
      ...individualLessons.map((lesson: any) => ({
        ...lesson,
        date: new Date(lesson.date).toISOString().split('T')[0]
      })),
      ...upcomingGroupLessons
    ].sort((a: any, b: any) => {
      const dateA = new Date(`${a.date} ${a.start_time}`);
      const dateB = new Date(`${b.date} ${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 10);

    res.json({ success: true, data: allLessons });
  } catch (error) {
    console.error('Error fetching upcoming lessons:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении предстоящих занятий' });
  }
});

// Получение уведомлений для студента (пока используем моковые данные)
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Временно используем статические уведомления, позже можно создать таблицу notifications
    const mockNotifications = [
      {
        id: 1,
        text: "Новое занятие назначено на завтра в 10:00",
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: "info"
      },
      {
        id: 2,
        text: "Вы успешно завершили урок по правилам дорожного движения",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // вчера
        read: true,
        type: "success"
      },
      {
        id: 3,
        text: "Не забудьте подготовиться к следующему экзамену",
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // позавчера
        read: false,
        type: "warning"
      }
    ];

    res.json({ success: true, data: mockNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении уведомлений' });
  }
});

// Получение курсов студента
router.get('/courses', authenticateToken, async (req, res) => {
  try {
    console.log('Student courses route called for user:', req.user);
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('Student courses: No user ID found');
      return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    // Проверяем, что пользователь является студентом
    if (req.user?.role !== 'student') {
      console.log('Student courses: User is not a student, role:', req.user?.role);
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        sc.enrollment_date,
        sc.completion_date,
        sc.is_active,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM student_lesson_progress slp 
         JOIN lessons l ON slp.lesson_id = l.id 
         WHERE l.course_id = c.id AND slp.student_id = sc.student_id AND slp.is_completed = true) as completed_lessons,
        CASE 
          WHEN sc.completion_date IS NOT NULL THEN 'completed'
          WHEN sc.is_active = true THEN 'active'
          ELSE 'paused'
        END as status,
        ROUND(
          COALESCE(
            (SELECT COUNT(*) FROM student_lesson_progress slp 
             JOIN lessons l ON slp.lesson_id = l.id 
             WHERE l.course_id = c.id AND slp.student_id = sc.student_id AND slp.is_completed = true) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = c.id), 0), 0
          ), 2
        ) as progress
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE sc.student_id = ?
      ORDER BY sc.enrollment_date DESC
    `;

    const [courses] = await pool.execute<RowDataPacket[]>(query, [userId]);

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении курсов' });
  }
});

// Получение уроков курса для студента
router.get('/courses/:courseId/lessons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const courseId = parseInt(req.params.courseId);
    
    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Неверные параметры' });
    }

    // Проверяем, что пользователь является студентом
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, что студент записан на этот курс
    const [enrollment] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ success: false, message: 'Вы не записаны на этот курс' });
    }

    const query = `
      SELECT 
        l.*,
        COALESCE(slp.is_completed, false) as is_completed,
        slp.completed_at
      FROM lessons l
      LEFT JOIN student_lesson_progress slp ON l.id = slp.lesson_id AND slp.student_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_index ASC
    `;

    const [lessons] = await pool.execute<RowDataPacket[]>(query, [userId, courseId]);

    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении уроков' });
  }
});

// Отметка урока как пройденного
router.post('/lessons/:lessonId/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const lessonId = parseInt(req.params.lessonId);
    
    if (!userId || !lessonId) {
      return res.status(400).json({ success: false, message: 'Неверные параметры' });
    }

    // Проверяем, что пользователь является студентом
    if (req.user?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Доступ запрещен' });
    }

    // Проверяем, что урок существует и студент записан на курс
    const [lesson] = await pool.execute<RowDataPacket[]>(
      `SELECT l.*, sc.id as enrollment_id 
       FROM lessons l
       JOIN student_courses sc ON l.course_id = sc.course_id
       WHERE l.id = ? AND sc.student_id = ?`,
      [lessonId, userId]
    );

    if (lesson.length === 0) {
      return res.status(403).json({ success: false, message: 'Урок не найден или доступ запрещен' });
    }

    // Добавляем или обновляем прогресс урока
    await pool.execute(
      `INSERT INTO student_lesson_progress (student_id, lesson_id, is_completed, completed_at)
       VALUES (?, ?, true, NOW())
       ON DUPLICATE KEY UPDATE is_completed = true, completed_at = NOW()`,
      [userId, lessonId]
    );

    res.json({ success: true, message: 'Урок отмечен как пройденный' });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ success: false, message: 'Ошибка при отметке урока' });
  }
});

export default router;
