import express from 'express';
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  completeLesson,
  reorderLessons,
  getAllLessons,
  getTestByLessonId,
  submitTest
} from '../controllers/lessonsController';
import { authenticateToken } from '../middleware/auth';
import { requireInstructorOrAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Роуты для админ панели
router.get('/', authenticateToken, requireInstructorOrAdmin, getAllLessons); // Получение всех уроков для админки

// Роуты для студентов
router.get('/course/:courseId', authenticateToken, getLessonsByCourse); // Получение уроков курса
router.get('/:id', authenticateToken, getLessonById); // Получение урока по ID
router.get('/:id/test', authenticateToken, getTestByLessonId); // Получение теста урока
router.post('/:id/complete', authenticateToken, completeLesson); // Завершение урока
router.post('/:id/test/submit', authenticateToken, submitTest); // Отправка результатов теста

// Роуты для инструкторов и админов
router.post('/', authenticateToken, requireInstructorOrAdmin, createLesson); // Создание урока
router.put('/:id', authenticateToken, requireInstructorOrAdmin, updateLesson); // Обновление урока
router.delete('/:id', authenticateToken, requireInstructorOrAdmin, deleteLesson); // Удаление урока
router.put('/course/:courseId/reorder', authenticateToken, requireInstructorOrAdmin, reorderLessons); // Изменение порядка уроков

export default router;
