import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  updateUserAvatar,
  deleteUserAvatar,
  getAllStudents,
  getStats,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupDetails,
  addStudentToGroup,
  removeStudentFromGroup
} from '../controllers/adminController';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllIndividualLessons,
  createIndividualLesson,
  updateIndividualLesson,
  deleteIndividualLesson,
  updateIndividualLessonStatus,
  createOneTimeGroupLesson,
  updateOneTimeGroupLesson
} from '../controllers/schedulesController';
import {
  getPriceCategories,
  createPriceCategory,
  updatePriceCategory,
  deletePriceCategory,
  getPricePlans,
  createPricePlan,
  updatePricePlan,
  deletePricePlan,
  getAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  getPriceDiscounts,
  createPriceDiscount,
  updatePriceDiscount,
  deletePriceDiscount
} from '../controllers/pricesControllerNew';
import {
  getReports,
  exportReport
} from '../controllers/reportsController';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Middleware для проверки роли админа
const requireAdmin = requireRole(['admin']);

// Получить всех пользователей
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

// Получить статистику
router.get('/stats', authenticateToken, requireAdmin, getStats);

// Получить все группы
router.get('/groups', authenticateToken, requireAdmin, getGroups);
router.post('/groups', authenticateToken, requireAdmin, createGroup);
router.put('/groups/:id', authenticateToken, requireAdmin, updateGroup);
router.delete('/groups/:id', authenticateToken, requireAdmin, deleteGroup);

// Маршруты для управления студентами в группах
router.get('/groups/:id/details', authenticateToken, requireAdmin, getGroupDetails);
router.post('/groups/:id/students', authenticateToken, requireAdmin, addStudentToGroup);
router.delete('/groups/:id/students/:studentId', authenticateToken, requireAdmin, removeStudentFromGroup);

// Получить всех студентов
router.get('/students', authenticateToken, requireAdmin, getAllStudents);

// Получить пользователя по ID
router.get('/users/:id', authenticateToken, requireAdmin, getUserById);

// Создать нового пользователя
router.post('/users', authenticateToken, requireAdmin, createUser);

// Обновить пользователя
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);

// Удалить пользователя
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// Обновить аватар пользователя
router.post('/users/:id/avatar', authenticateToken, requireAdmin, uploadMiddleware, updateUserAvatar);

// Удалить аватар пользователя
router.delete('/users/:id/avatar', authenticateToken, requireAdmin, deleteUserAvatar);

// Маршруты для расписания групп
router.get('/schedules', authenticateToken, requireAdmin, getAllSchedules);
router.post('/schedules', authenticateToken, requireAdmin, createSchedule);
router.put('/schedules/:id', authenticateToken, requireAdmin, updateSchedule);
router.delete('/schedules/:id', authenticateToken, requireAdmin, deleteSchedule);

// Создание одноразового группового занятия
router.post('/schedules/one-time-group', authenticateToken, requireAdmin, createOneTimeGroupLesson);
// Обновление одноразового группового занятия
router.put('/schedules/one-time-group/:id', authenticateToken, requireAdmin, updateOneTimeGroupLesson);

// Маршруты для индивидуальных занятий
router.get('/individual-lessons', authenticateToken, requireAdmin, getAllIndividualLessons);
router.post('/individual-lessons', authenticateToken, requireAdmin, createIndividualLesson);
router.put('/individual-lessons/:id', authenticateToken, requireAdmin, updateIndividualLesson);
router.delete('/individual-lessons/:id', authenticateToken, requireAdmin, deleteIndividualLesson);
router.put('/individual-lessons/:id/status', authenticateToken, requireAdmin, updateIndividualLessonStatus);

// Маршруты для категорий цен
router.get('/price-categories', authenticateToken, requireAdmin, getPriceCategories);
router.post('/price-categories', authenticateToken, requireAdmin, createPriceCategory);
router.put('/price-categories/:id', authenticateToken, requireAdmin, updatePriceCategory);
router.delete('/price-categories/:id', authenticateToken, requireAdmin, deletePriceCategory);

// Маршруты для тарифных планов
router.get('/price-plans', authenticateToken, requireAdmin, getPricePlans);
router.post('/price-plans', authenticateToken, requireAdmin, createPricePlan);
router.put('/price-plans/:id', authenticateToken, requireAdmin, updatePricePlan);
router.delete('/price-plans/:id', authenticateToken, requireAdmin, deletePricePlan);

// Маршруты для дополнительных услуг
router.get('/additional-services', authenticateToken, requireAdmin, getAdditionalServices);
router.post('/additional-services', authenticateToken, requireAdmin, createAdditionalService);
router.put('/additional-services/:id', authenticateToken, requireAdmin, updateAdditionalService);
router.delete('/additional-services/:id', authenticateToken, requireAdmin, deleteAdditionalService);

// Маршруты для скидок
router.get('/price-discounts', authenticateToken, requireAdmin, getPriceDiscounts);
router.post('/price-discounts', authenticateToken, requireAdmin, createPriceDiscount);
router.put('/price-discounts/:id', authenticateToken, requireAdmin, updatePriceDiscount);
router.delete('/price-discounts/:id', authenticateToken, requireAdmin, deletePriceDiscount);

// Маршруты для отчетов
router.get('/reports/:type', authenticateToken, requireAdmin, getReports);
router.get('/reports/:type/export', authenticateToken, requireAdmin, exportReport);

export default router;
