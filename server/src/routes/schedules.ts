import express from 'express';
import { authenticateToken, requireAdmin, requireInstructor, requireStudent } from '../middleware/auth';
import {
  getGroupSchedule,
  getStudentSchedule,
  getStudentGroup,
  getStudentGroupSchedule,
  getInstructorSchedule,
  getInstructorUpcomingLesson,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllSchedules,
  getAllIndividualLessons,
  getInstructorIndividualLessons,
  createIndividualLesson,
  updateIndividualLessonStatus,
  createOneTimeGroupLesson
} from '../controllers/schedulesController';

const router = express.Router();

// Маршруты для студентов
router.get('/student/schedule', authenticateToken, requireStudent, getStudentSchedule);
router.get('/student/group', authenticateToken, requireStudent, getStudentGroup);
router.get('/student/group-schedule', authenticateToken, requireStudent, getStudentGroupSchedule);

// Маршруты для инструкторов - получение своего расписания
router.get('/my', authenticateToken, requireInstructor, getInstructorSchedule);
router.get('/my/upcoming', authenticateToken, requireInstructor, getInstructorUpcomingLesson);

// Маршруты для администраторов и инструкторов
router.get('/', authenticateToken, requireInstructor, getAllSchedules);
router.get('/group/:groupId', authenticateToken, requireInstructor, getGroupSchedule);

// Маршруты только для администраторов и инструкторов
router.post('/', authenticateToken, requireInstructor, createSchedule);
router.post('/group-lesson', authenticateToken, requireInstructor, createOneTimeGroupLesson);
router.put('/:id', authenticateToken, requireAdmin, updateSchedule);
router.delete('/:id', authenticateToken, requireAdmin, deleteSchedule);

// Маршруты для индивидуальных занятий
router.get('/individual', authenticateToken, requireInstructor, getAllIndividualLessons);
router.get('/individual/my', authenticateToken, requireInstructor, getInstructorIndividualLessons);
router.post('/individual', authenticateToken, requireInstructor, createIndividualLesson);
router.put('/individual/:id/status', authenticateToken, requireInstructor, updateIndividualLessonStatus);

export default router;
