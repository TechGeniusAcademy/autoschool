import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  markMessageAsRead,
  respondToMessage,
  deleteContactMessage,
  getContactMessagesStats
} from '../controllers/contactMessageController';
import { validateContactMessage, validateMessageResponse } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// Публичный маршрут для отправки сообщения
router.post('/', validateContactMessage, createContactMessage);

// Тестовый роут для проверки данных в базе
router.get('/test', async (req, res) => {
  try {
    const [messages] = await pool.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({
      success: true,
      data: messages,
      count: (messages as any[]).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Маршруты для админов
router.get('/', authenticateToken, requireAdmin, getAllContactMessages);
router.get('/stats', authenticateToken, requireAdmin, getContactMessagesStats);
router.get('/:id', authenticateToken, requireAdmin, getContactMessageById);
router.patch('/:id/read', authenticateToken, requireAdmin, markMessageAsRead);
router.patch('/:id/respond', authenticateToken, requireAdmin, validateMessageResponse, respondToMessage);
router.delete('/:id', authenticateToken, requireAdmin, deleteContactMessage);

export default router;
