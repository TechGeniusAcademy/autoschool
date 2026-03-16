import express from 'express';
import { 
  getGeneralStats, 
  getStudentsStats, 
  getInstructorsStats, 
  getCoursesStats,
  exportReport 
} from '../controllers/reportsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Все роуты требуют аутентификации и роль админа
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Получить общую статистику
router.get('/general', getGeneralStats);

// Получить статистику студентов
router.get('/students', getStudentsStats);

// Получить статистику инструкторов
router.get('/instructors', getInstructorsStats);

// Получить статистику курсов
router.get('/courses', getCoursesStats);

// Экспорт отчетов
router.get('/export/:type', exportReport);

export default router;
