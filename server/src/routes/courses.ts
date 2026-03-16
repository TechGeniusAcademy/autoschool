import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignCourseToStudent,
  getStudentCourses,
  getPublicCourses,
  getPublicCourseBySlug,
  getCourseStudents,
  assignStudentsToCourse,
  unassignStudentFromCourse,
  // Методы для работы с уроками
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
} from '../controllers/coursesController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireInstructorOrAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Публичные роуты
router.get('/public', getPublicCourses); // Публичный список курсов для каталога
router.get('/public/:slug', getPublicCourseBySlug); // Публичный просмотр курса по slug

// Роуты для студентов
router.get('/my-courses', authenticateToken, getStudentCourses); // Курсы студента

// Админские роуты
router.get('/', authenticateToken, requireInstructorOrAdmin, getAllCourses); // Все курсы для админки
router.get('/:id', authenticateToken, requireInstructorOrAdmin, getCourseById); // Получение курса по ID
router.get('/:id/students', authenticateToken, requireInstructorOrAdmin, getCourseStudents); // Получение студентов курса
router.post('/', authenticateToken, requireInstructorOrAdmin, createCourse); // Создание курса
router.put('/:id', authenticateToken, requireInstructorOrAdmin, updateCourse); // Обновление курса
router.delete('/:id', authenticateToken, requireAdmin, deleteCourse); // Удаление курса
router.post('/assign', authenticateToken, requireAdmin, assignCourseToStudent); // Назначение курса студенту
router.post('/:id/assign-students', authenticateToken, requireAdmin, assignStudentsToCourse); // Назначение нескольких студентов на курс
router.delete('/:id/unassign-student/:studentId', authenticateToken, requireAdmin, unassignStudentFromCourse); // Отчисление студента с курса

// Роуты для работы с уроками курса
router.get('/:courseId/lessons', authenticateToken, requireInstructorOrAdmin, getLessonsByCourse); // Получение уроков курса
router.post('/:courseId/lessons', authenticateToken, requireInstructorOrAdmin, createLesson); // Создание урока
router.put('/:courseId/lessons/:lessonId', authenticateToken, requireInstructorOrAdmin, updateLesson); // Обновление урока
router.delete('/:courseId/lessons/:lessonId', authenticateToken, requireInstructorOrAdmin, deleteLesson); // Удаление урока  
router.put('/:courseId/lessons/reorder', authenticateToken, requireInstructorOrAdmin, reorderLessons); // Изменение порядка уроков

export default router;
