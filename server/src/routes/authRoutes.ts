import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile,
  changePassword,
  verifyTokenEndpoint 
} from '../controllers/authController';
import { 
  validateRegister, 
  validateLogin 
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты (не требуют аутентификации)
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Защищенные маршруты (требуют аутентификации)
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.get('/verify', authenticateToken, verifyTokenEndpoint);

export default router;
