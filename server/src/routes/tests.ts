import express from 'express';
import {
  createLessonTest,
  getTestByLessonId,
  updateLessonTest,
  submitTestAttempt,
  getStudentTestResults,
  deleteLessonTest
} from '../controllers/testsController';
import { authenticateToken } from '../middleware/auth';
import { requireInstructorOrAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Роуты для студентов
router.get('/lesson/:lessonId', authenticateToken, getTestByLessonId); // Получение теста урока
router.post('/:testId/submit', authenticateToken, submitTestAttempt); // Прохождение теста
router.get('/results/lesson/:lessonId', authenticateToken, getStudentTestResults); // Результаты тестов студента

// Роуты для инструкторов и админов
router.post('/', authenticateToken, requireInstructorOrAdmin, createLessonTest); // Создание теста
router.put('/:id', authenticateToken, requireInstructorOrAdmin, updateLessonTest); // Обновление теста
router.delete('/:id', authenticateToken, requireInstructorOrAdmin, deleteLessonTest); // Удаление теста

export default router;
