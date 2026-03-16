import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Интерфейсы
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

// Создание теста для урока
export const createLessonTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      lesson_id,
      title,
      description,
      passing_score = 70,
      time_limit = 0,
      max_attempts = 3,
      questions
    } = req.body;

    // Проверяем, что урок существует и это тест
    const [lesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id, lesson_type FROM lessons WHERE id = ?',
      [lesson_id]
    );

    if (lesson.length === 0) {
      res.status(404).json({ success: false, message: 'Урок не найден' });
      return;
    }

    if (lesson[0].lesson_type !== 'test') {
      res.status(400).json({ 
        success: false, 
        message: 'Тест можно создать только для урока типа "test"' 
      });
      return;
    }

    // Проверяем, нет ли уже теста для этого урока
    const [existingTest] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM lesson_tests WHERE lesson_id = ?',
      [lesson_id]
    );

    if (existingTest.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Тест для этого урока уже существует' 
      });
      return;
    }

    // Валидируем вопросы
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Необходимо добавить хотя бы один вопрос' 
      });
      return;
    }

    for (const question of questions) {
      if (!question.question || !question.type || !question.correct_answers) {
        res.status(400).json({ 
          success: false, 
          message: 'Каждый вопрос должен содержать текст, тип и правильные ответы' 
        });
        return;
      }

      if ((question.type === 'single' || question.type === 'multiple') && 
          (!question.options || question.options.length < 2)) {
        res.status(400).json({ 
          success: false, 
          message: 'Вопросы с вариантами ответов должны содержать минимум 2 варианта' 
        });
        return;
      }
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO lesson_tests (
        lesson_id, title, description, passing_score, 
        time_limit, max_attempts, questions
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lesson_id, title, description, passing_score,
        time_limit, max_attempts, JSON.stringify(questions)
      ]
    );

    // Получаем созданный тест
    const [newTest] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lesson_tests WHERE id = ?',
      [result.insertId]
    );

    const test = newTest[0];
    test.questions = JSON.parse(test.questions);

    res.status(201).json({
      success: true,
      message: 'Тест создан успешно',
      data: test
    });
  } catch (error) {
    console.error('Ошибка при создании теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение теста по ID урока
export const getTestByLessonId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const studentId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const [tests] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lesson_tests WHERE lesson_id = ?',
      [lessonId]
    );

    if (tests.length === 0) {
      res.status(404).json({ success: false, message: 'Тест не найден' });
      return;
    }

    const test = tests[0];
    test.questions = JSON.parse(test.questions);

    // Для студентов - скрываем правильные ответы и добавляем информацию о попытках
    if (userRole === 'student') {
      // Убираем правильные ответы из вопросов
      test.questions = test.questions.map((q: TestQuestion) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options,
        points: q.points
      }));

      if (studentId) {
        // Получаем попытки студента
        const [attempts] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM test_attempts WHERE student_id = ? AND test_id = ? ORDER BY attempt_number DESC',
          [studentId, test.id]
        );

        test.attempts = attempts;
        test.attemptsUsed = attempts.length;
        test.canTakeTest = attempts.length < test.max_attempts;
        test.bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
        test.passed = attempts.some(a => a.passed);
      }
    }

    res.json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Ошибка при получении теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Обновление теста
export const updateLessonTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      passing_score,
      time_limit,
      max_attempts,
      questions
    } = req.body;

    // Валидируем вопросы если они переданы
    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Необходимо добавить хотя бы один вопрос' 
        });
        return;
      }

      for (const question of questions) {
        if (!question.question || !question.type || !question.correct_answers) {
          res.status(400).json({ 
            success: false, 
            message: 'Каждый вопрос должен содержать текст, тип и правильные ответы' 
          });
          return;
        }
      }
    }

    await pool.execute(
      `UPDATE lesson_tests SET 
        title = ?, description = ?, passing_score = ?, 
        time_limit = ?, max_attempts = ?, questions = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title, description, passing_score,
        time_limit, max_attempts, 
        questions ? JSON.stringify(questions) : questions,
        id
      ]
    );

    // Получаем обновленный тест
    const [updatedTest] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lesson_tests WHERE id = ?',
      [id]
    );

    const test = updatedTest[0];
    test.questions = JSON.parse(test.questions);

    res.json({
      success: true,
      message: 'Тест обновлен успешно',
      data: test
    });
  } catch (error) {
    console.error('Ошибка при обновлении теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Прохождение теста студентом
export const submitTestAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;
    const { answers, timeSpent = 0 } = req.body;
    const studentId = (req as any).user.id;

    // Получаем тест
    const [tests] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM lesson_tests WHERE id = ?',
      [testId]
    );

    if (tests.length === 0) {
      res.status(404).json({ success: false, message: 'Тест не найден' });
      return;
    }

    const test = tests[0];
    test.questions = JSON.parse(test.questions);

    // Проверяем количество попыток
    const [existingAttempts] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM test_attempts WHERE student_id = ? AND test_id = ?',
      [studentId, testId]
    );

    if (existingAttempts[0].count >= test.max_attempts) {
      res.status(400).json({ 
        success: false, 
        message: 'Превышено максимальное количество попыток' 
      });
      return;
    }

    // Проверяем доступ к уроку
    const [lesson] = await pool.execute<RowDataPacket[]>(
      'SELECT course_id FROM lessons WHERE id = ?',
      [test.lesson_id]
    );

    const [enrollment] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND is_active = true',
      [studentId, lesson[0].course_id]
    );

    if (enrollment.length === 0) {
      res.status(403).json({ success: false, message: 'Доступ к тесту запрещен' });
      return;
    }

    // Подсчитываем результат
    let totalScore = 0;
    let maxScore = 0;
    const detailedResults: any[] = [];

    for (const question of test.questions) {
      maxScore += question.points;
      const studentAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'single') {
        isCorrect = question.correct_answers.includes(studentAnswer);
      } else if (question.type === 'multiple') {
        const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [];
        const correctAnswers = question.correct_answers;
        isCorrect = studentAnswers.length === correctAnswers.length &&
                   studentAnswers.every(ans => correctAnswers.includes(ans));
      } else if (question.type === 'text') {
        // Для текстовых вопросов - простое сравнение (можно улучшить)
        const normalizedStudent = (studentAnswer || '').toLowerCase().trim();
        isCorrect = question.correct_answers.some((correct: string) => 
          correct.toLowerCase().trim() === normalizedStudent
        );
      }

      if (isCorrect) {
        totalScore += question.points;
      }

      detailedResults.push({
        questionId: question.id,
        studentAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points
      });
    }

    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = scorePercentage >= test.passing_score;

    // Сохраняем попытку
    const attemptNumber = existingAttempts[0].count + 1;

    await pool.execute(
      `INSERT INTO test_attempts (
        student_id, lesson_id, test_id, answers, score, max_score,
        passed, attempt_number, completed_at, time_taken
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [
        studentId, test.lesson_id, testId, JSON.stringify(answers),
        scorePercentage, 100, passed, attemptNumber, timeSpent
      ]
    );

    // Если тест пройден, автоматически завершаем урок
    if (passed) {
      await pool.execute(
        `INSERT INTO lesson_progress (student_id, lesson_id, course_id, status, started_at, completed_at, time_spent)
         VALUES (?, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
         ON DUPLICATE KEY UPDATE 
         status = 'completed',
         completed_at = CURRENT_TIMESTAMP,
         time_spent = time_spent + ?`,
        [studentId, test.lesson_id, lesson[0].course_id, timeSpent, timeSpent]
      );

      // Обновляем прогресс курса
      const [totalLessons] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
        [lesson[0].course_id]
      );

      const [completedLessons] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as completed FROM lesson_progress WHERE student_id = ? AND course_id = ? AND status = "completed"',
        [studentId, lesson[0].course_id]
      );

      const progressPercentage = (completedLessons[0].completed / totalLessons[0].total) * 100;

      await pool.execute(
        `UPDATE student_courses SET 
          progress_percentage = ?,
          started_at = CASE WHEN started_at IS NULL THEN CURRENT_TIMESTAMP ELSE started_at END,
          completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE student_id = ? AND course_id = ?`,
        [progressPercentage, progressPercentage, studentId, lesson[0].course_id]
      );
    }

    res.json({
      success: true,
      message: passed ? 'Тест пройден успешно!' : 'Тест не пройден. Попробуйте еще раз.',
      data: {
        score: Math.round(scorePercentage),
        maxScore: 100,
        passed,
        passingScore: test.passing_score,
        attemptNumber,
        attemptsLeft: test.max_attempts - attemptNumber,
        detailedResults: detailedResults,
        timeSpent
      }
    });
  } catch (error) {
    console.error('Ошибка при прохождении теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение результатов тестов студента
export const getStudentTestResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const studentId = (req as any).user.id;

    const [attempts] = await pool.execute<RowDataPacket[]>(
      `SELECT ta.*, lt.title as test_title, lt.passing_score, lt.max_attempts
       FROM test_attempts ta
       JOIN lesson_tests lt ON ta.test_id = lt.id
       WHERE ta.student_id = ? AND ta.lesson_id = ?
       ORDER BY ta.attempt_number DESC`,
      [studentId, lessonId]
    );

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Ошибка при получении результатов тестов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Удаление теста
export const deleteLessonTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM lesson_tests WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Тест удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении теста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};
