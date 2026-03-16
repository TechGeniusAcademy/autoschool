import express from 'express';
import { uploadAvatar, deleteAvatar } from '../controllers/avatarController';
import { uploadAvatar as uploadMiddleware } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Загрузка аватарки (защищенный маршрут)
router.post('/upload', authenticateToken, uploadMiddleware, uploadAvatar);

// Удаление аватарки (защищенный маршрут)
router.delete('/delete', authenticateToken, deleteAvatar);

export default router;
