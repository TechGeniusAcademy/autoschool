import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Интерфейсы
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
}

interface TestQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correct_answers: string[];
  points: number;
}

interface LessonTest {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  passing_score: number;
  time_limit: number;
  max_attempts: number;
  questions: TestQuestion[];
}

// Создание урока
export const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      course_id,
      title,
      description,
      content,
      lesson_type,
      video_url,
      video_duration,
      live_stream_date,
      live_stream_url,
      is_preview = false
    } = req.body;

    // Получаем следующий порядковый номер
    const [maxOrder] = await pool.execute<RowDataPacket[]>(
      'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM lessons WHERE course_id = ?',
      [course_id]
    );

    const order_index = maxOrder[0].next_order;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO lessons (
        course_id, title, description, content, lesson_type,
        video_url, video_duration, live_stream_date, live_stream_url,
        order_index, is_preview
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id, 
        title, 
        description || null, 
        content || null, 
        lesson_type,
        video_url || null, 
        video_duration || null, 
        live_stream_date || null, 
        live_stream_url || null,
        order_index, 
        is_preview
      ]
    );

    // Получаем созданный урок
    const [newLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Урок создан успешно',
      data: newLesson[0]
    });
  } catch (error) {
    console.error('Ошибка при создании урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение уроков курса
export const getLessonsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const studentId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    let query = `
      SELECT l.*,
             (SELECT COUNT(*) FROM lesson_tests WHERE lesson_id = l.id) as has_test
    `;

    // Если это студент, добавляем информацию о прогрессе
    if (userRole === 'student' && studentId) {
      query += `,
             lp.status as progress_status,
             lp.started_at as progress_started_at,
             lp.completed_at as progress_completed_at,
             (SELECT COUNT(*) FROM test_attempts ta 
              JOIN lesson_tests lt ON ta.test_id = lt.id 
              WHERE ta.student_id = ? AND lt.lesson_id = l.id AND ta.passed = true) as test_passed
      `;
    }

    query += `
      FROM lessons l
    `;

    if (userRole === 'student' && studentId) {
      query += `
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
      `;
    }

    query += `
      WHERE l.course_id = ?
      ORDER BY l.order_index ASC
    `;

    const params = userRole === 'student' && studentId ? [studentId, studentId, courseId] : [courseId];
    const [lessons] = await pool.execute<RowDataPacket[]>(query, params);

    // Для студентов - проверяем доступность уроков
    if (userRole === 'student' && studentId) {
      const processedLessons = [];
      
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        let isAccessible = false;

        if (i === 0 || lesson.is_preview) {
          // Первый урок и preview уроки всегда доступны
          isAccessible = true;
        } else {
          // Проверяем, завершен ли предыдущий урок
          const prevLesson = lessons[i - 1];
          
          if (prevLesson.progress_status === 'completed') {
            // Если предыдущий урок - тест, проверяем, пройден ли он
            if (prevLesson.has_test > 0) {
              isAccessible = prevLesson.test_passed > 0;
            } else {
              isAccessible = true;
            }
          }
        }

        processedLessons.push({
          ...lesson,
          isAccessible
        });
      }

      res.json({
        success: true,
        data: processedLessons
      });
    } else {
      res.json({
        success: true,
        data: lessons
      });
    }
  } catch (error) {
    console.error('Ошибка при получении уроков:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение урока по ID
export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const studentId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const [lessons] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE id = ?',
      [id]
    );

    if (lessons.length === 0) {
      res.status(404).json({ success: false, message: 'Урок не найден' });
      return;
    }

    const lesson = lessons[0];

    // Для студентов проверяем доступность урока
    if (userRole === 'student' && studentId) {
      // Проверяем, назначен ли курс студенту
      const [enrollment] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND is_active = true',
        [studentId, lesson.course_id]
      );

      if (enrollment.length === 0) {
        res.status(403).json({ success: false, message: 'Доступ к уроку запрещен' });
        return;
      }

      // Проверяем последовательность доступа к урокам
      const [lessonOrder] = await pool.execute<RowDataPacket[]>(
        'SELECT order_index FROM lessons WHERE id = ? AND course_id = ?',
        [id, lesson.course_id]
      );

      if (lessonOrder[0].order_index > 1 && !lesson.is_preview) {
        // Проверяем, завершен ли предыдущий урок
        const [prevLessonProgress] = await pool.execute<RowDataPacket[]>(
          `SELECT l.id, lp.status,
                  (SELECT COUNT(*) FROM lesson_tests WHERE lesson_id = l.id) as has_test,
                  (SELECT COUNT(*) FROM test_attempts ta 
                   JOIN lesson_tests lt ON ta.test_id = lt.id 
                   WHERE ta.student_id = ? AND lt.lesson_id = l.id AND ta.passed = true) as test_passed
           FROM lessons l
           LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
           WHERE l.course_id = ? AND l.order_index = ?`,
          [studentId, studentId, lesson.course_id, lessonOrder[0].order_index - 1]
        );

        if (prevLessonProgress.length > 0) {
          const prevLesson = prevLessonProgress[0];
          
          if (prevLesson.status !== 'completed') {
            res.status(403).json({ 
              success: false, 
              message: 'Сначала завершите предыдущий урок' 
            });
            return;
          }

          if (prevLesson.has_test > 0 && prevLesson.test_passed === 0) {
            res.status(403).json({ 
              success: false, 
              message: 'Сначала пройдите тест предыдущего урока' 
            });
            return;
          }
        }
      }

      // Отмечаем начало изучения урока
      await pool.execute(
        `INSERT INTO lesson_progress (student_id, lesson_id, course_id, status, started_at)
         VALUES (?, ?, ?, 'in_progress', CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
         status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END,
         started_at = CASE WHEN started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END`,
        [studentId, id, lesson.course_id]
      );
    }

    // Получаем тест урока, если есть
    const [tests] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lesson_tests WHERE lesson_id = ?',
      [id]
    );

    const responseData: any = { ...lesson };

    if (tests.length > 0) {
      const test = tests[0];
      responseData.test = {
        ...test,
        questions: typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions
      };

      // Для студентов добавляем информацию о попытках
      if (userRole === 'student' && studentId) {
        const [attempts] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM test_attempts WHERE student_id = ? AND test_id = ? ORDER BY attempt_number DESC',
          [studentId, test.id]
        );

        responseData.test.attempts = attempts;
        responseData.test.attemptsUsed = attempts.length;
        responseData.test.canTakeTest = attempts.length < test.max_attempts;
        responseData.test.bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
        responseData.test.passed = attempts.some(a => a.passed);
      }
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Ошибка при получении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Обновление урока
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

    await pool.execute(
      `UPDATE lessons SET 
        title = ?, description = ?, content = ?, lesson_type = ?,
        video_url = ?, video_duration = ?, live_stream_date = ?, live_stream_url = ?,
        order_index = ?, is_preview = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, description, content, lesson_type,
        video_url, video_duration, live_stream_date, live_stream_url,
        order_index, is_preview, id
      ]
    );

    const [updatedLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lessons WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Урок обновлен успешно',
      data: updatedLesson[0]
    });
  } catch (error) {
    console.error('Ошибка при обновлении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Удаление урока
export const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM lessons WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Урок удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Завершение урока студентом
export const completeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const studentId = (req as any).user.id;
    const { timeSpent = 0 } = req.body;

    // Проверяем, что урок существует
    const [lessons] = await pool.execute<RowDataPacket[]>(
      'SELECT course_id FROM lessons WHERE id = ?',
      [id]
    );

    if (lessons.length === 0) {
      res.status(404).json({ success: false, message: 'Урок не найден' });
      return;
    }

    const courseId = lessons[0].course_id;

    // Обновляем прогресс урока
    await pool.execute(
      `INSERT INTO lesson_progress (student_id, lesson_id, course_id, status, started_at, completed_at, time_spent)
       VALUES (?, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
       ON DUPLICATE KEY UPDATE 
       status = 'completed',
       completed_at = CURRENT_TIMESTAMP,
       time_spent = time_spent + ?`,
      [studentId, id, courseId, timeSpent, timeSpent]
    );

    // Обновляем общий прогресс курса
    const [totalLessons] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
      [courseId]
    );

    const [completedLessons] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as completed FROM lesson_progress WHERE student_id = ? AND course_id = ? AND status = "completed"',
      [studentId, courseId]
    );

    const progressPercentage = (completedLessons[0].completed / totalLessons[0].total) * 100;

    await pool.execute(
      `UPDATE student_courses SET 
        progress_percentage = ?,
        started_at = CASE WHEN started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END,
        completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE student_id = ? AND course_id = ?`,
      [progressPercentage, progressPercentage, studentId, courseId]
    );

    res.json({
      success: true,
      message: 'Урок завершен успешно',
      data: {
        progressPercentage: Math.round(progressPercentage)
      }
    });
  } catch (error) {
    console.error('Ошибка при завершении урока:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Изменение порядка уроков
export const reorderLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body; // Массив ID уроков в новом порядке

    // Обновляем order_index для каждого урока
    for (let i = 0; i < lessonIds.length; i++) {
      await pool.execute(
        'UPDATE lessons SET order_index = ? WHERE id = ? AND course_id = ?',
        [i + 1, lessonIds[i], courseId]
      );
    }

    res.json({
      success: true,
      message: 'Порядок уроков обновлен успешно'
    });
  } catch (error) {
    console.error('Ошибка при изменении порядка уроков:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение всех уроков для админ панели
export const getAllLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const published = req.query.published as string;
    const course = req.query.course as string;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.id, l.title, l.lesson_type as type, l.content, l.video_url, l.order_index, 
             l.is_preview as is_free, l.video_duration as duration_minutes, 
             l.created_at, c.title as course_title, c.id as course_id,
             CASE WHEN l.content IS NOT NULL OR l.video_url IS NOT NULL THEN true ELSE false END as is_published
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(l.title LIKE ? OR l.description LIKE ? OR c.title LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type) {
      conditions.push('l.lesson_type = ?');
      params.push(type);
    }

    if (published) {
      if (published === 'true') {
        conditions.push('(l.content IS NOT NULL OR l.video_url IS NOT NULL)');
      } else if (published === 'false') {
        conditions.push('(l.content IS NULL AND l.video_url IS NULL)');
      }
    }

    if (course) {
      conditions.push('l.course_id = ?');
      params.push(parseInt(course));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY l.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [lessons] = await pool.execute<RowDataPacket[]>(query, params);

    // Подсчет общего количества уроков
    let countQuery = 'SELECT COUNT(*) as total FROM lessons l LEFT JOIN courses c ON l.course_id = c.id';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      // Копируем параметры фильтров
      if (search) {
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (type) {
        countParams.push(type);
      }
      if (course) {
        countParams.push(parseInt(course));
      }
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении уроков:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение теста по ID урока
export const getTestByLessonId = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = (req as any).userId;

    if (!lessonId || isNaN(lessonId)) {
      res.status(400).json({ success: false, message: 'Некорректный ID урока' });
      return;
    }

    // Проверяем доступность урока для студента
    const accessQuery = `
      SELECT 1 FROM student_courses sc
      JOIN lessons l ON l.course_id = sc.course_id
      WHERE sc.student_id = ? AND l.id = ? AND sc.status = 'active'
    `;
    const [accessResult] = await pool.execute<RowDataPacket[]>(accessQuery, [userId, lessonId]);

    if (accessResult.length === 0) {
      res.status(403).json({ success: false, message: 'Доступ к уроку запрещен' });
      return;
    }

    // Получаем тест
    const testQuery = `
      SELECT id, lesson_id, title, description, passing_score, time_limit, max_attempts, questions
      FROM lesson_tests
      WHERE lesson_id = ?
    `;
    const [testResult] = await pool.execute<RowDataPacket[]>(testQuery, [lessonId]);

    if (testResult.length === 0) {
      res.status(404).json({ success: false, message: 'Тест не найден для данного урока' });
      return;
    }

    const test = testResult[0];
    
    // Парсим вопросы из JSON
    try {
      test.questions = JSON.parse(test.questions);
    } catch (error) {
      console.error('Ошибка парсинга вопросов теста:', error);
      res.status(500).json({ success: false, message: 'Ошибка в структуре теста' });
      return;
    }

    // Удаляем правильные ответы из вопросов для безопасности
    test.questions = test.questions.map((question: TestQuestion) => ({
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.options,
      points: question.points
    }));

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Ошибка при получении теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Отправка результатов теста
export const submitTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const lessonId = parseInt(req.params.id);
    const userId = (req as any).userId;
    const { answers } = req.body;

    if (!lessonId || isNaN(lessonId)) {
      res.status(400).json({ success: false, message: 'Некорректный ID урока' });
      return;
    }

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, message: 'Ответы не предоставлены' });
      return;
    }

    // Проверяем доступность урока для студента
    const accessQuery = `
      SELECT 1 FROM student_courses sc
      JOIN lessons l ON l.course_id = sc.course_id
      WHERE sc.student_id = ? AND l.id = ? AND sc.status = 'active'
    `;
    const [accessResult] = await pool.execute<RowDataPacket[]>(accessQuery, [userId, lessonId]);

    if (accessResult.length === 0) {
      res.status(403).json({ success: false, message: 'Доступ к уроку запрещен' });
      return;
    }

    // Получаем тест с правильными ответами
    const testQuery = `
      SELECT id, lesson_id, title, passing_score, time_limit, max_attempts, questions
      FROM lesson_tests
      WHERE lesson_id = ?
    `;
    const [testResult] = await pool.execute<RowDataPacket[]>(testQuery, [lessonId]);

    if (testResult.length === 0) {
      res.status(404).json({ success: false, message: 'Тест не найден для данного урока' });
      return;
    }

    const test = testResult[0];
    let questions: TestQuestion[];
    
    try {
      questions = JSON.parse(test.questions);
    } catch (error) {
      console.error('Ошибка парсинга вопросов теста:', error);
      res.status(500).json({ success: false, message: 'Ошибка в структуре теста' });
      return;
    }

    // Проверяем количество попыток
    const attemptsQuery = `
      SELECT COUNT(*) as attempts_count
      FROM test_attempts
      WHERE student_id = ? AND test_id = ?
    `;
    const [attemptsResult] = await pool.execute<RowDataPacket[]>(attemptsQuery, [userId, test.id]);
    const attemptsCount = attemptsResult[0].attempts_count;

    if (attemptsCount >= test.max_attempts) {
      res.status(400).json({ success: false, message: 'Превышено максимальное количество попыток' });
      return;
    }

    // Вычисляем результат
    let score = 0;
    let maxScore = 0;
    const results = [];

    for (const question of questions) {
      maxScore += question.points;
      const studentAnswers = answers[question.id] || [];
      const correctAnswers = question.correct_answers;

      let questionScore = 0;
      if (question.type === 'text') {
        // For text questions, give full points if any answer is provided
        questionScore = studentAnswers.length > 0 && studentAnswers[0].trim() !== '' ? question.points : 0;
      } else {
        // For single/multiple choice questions
        if (Array.isArray(studentAnswers) && Array.isArray(correctAnswers)) {
          const studentSet = new Set(studentAnswers);
          const correctSet = new Set(correctAnswers);
          
          if (studentSet.size === correctSet.size && 
              [...studentSet].every(answer => correctSet.has(answer))) {
            questionScore = question.points;
          }
        }
      }
      
      score += questionScore;
      results.push({
        question_id: question.id,
        student_answers: studentAnswers,
        correct_answers: correctAnswers,
        points_earned: questionScore,
        max_points: question.points
      });
    }

    const passed = score >= test.passing_score;

    // Сохраняем результат попытки
    const insertAttemptQuery = `
      INSERT INTO test_attempts (student_id, test_id, lesson_id, score, max_score, passed, answers, results, attempt_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.execute<ResultSetHeader>(insertAttemptQuery, [
      userId,
      test.id,
      lessonId,
      score,
      maxScore,
      passed,
      JSON.stringify(answers),
      JSON.stringify(results)
    ]);

    // Если тест пройден, отмечаем урок как завершенный
    if (passed) {
      const progressQuery = `
        INSERT INTO lesson_progress (student_id, lesson_id, completed_at, progress_percentage)
        VALUES (?, ?, NOW(), 100)
        ON DUPLICATE KEY UPDATE completed_at = NOW(), progress_percentage = 100
      `;
      await pool.execute<ResultSetHeader>(progressQuery, [userId, lessonId]);
    }

    res.json({
      success: true,
      data: {
        score,
        max_score: maxScore,
        passed,
        percentage: Math.round((score / maxScore) * 100),
        attempts_remaining: test.max_attempts - attemptsCount - 1
      }
    });
  } catch (error) {
    console.error('Ошибка при отправке теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};
