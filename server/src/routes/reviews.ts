import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getPublicReviews,
  getAllReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  updateReviewLikes,
  getReviewsStats
} from '../controllers/reviewsController';

const router = express.Router();

// Публичные роуты
router.get('/public', getPublicReviews);

// Роуты для авторизованных пользователей
router.post('/create', authenticateToken, createReview); // Только авторизованные могут создавать отзывы
router.post('/:id/like', authenticateToken, updateReviewLikes); // Только авторизованные могут лайкать

// Роуты для админов
router.get('/admin/all', authenticateToken, requireAdmin, getAllReviews);
router.get('/admin/stats', authenticateToken, requireAdmin, getReviewsStats);
router.put('/admin/:id/status', authenticateToken, requireAdmin, updateReviewStatus);
router.put('/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  req.body = { is_approved: true };
  updateReviewStatus(req, res);
});
router.put('/:id/reject', authenticateToken, requireAdmin, (req, res) => {
  req.body = { is_approved: false };
  updateReviewStatus(req, res);
});
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteReview);

export default router;
