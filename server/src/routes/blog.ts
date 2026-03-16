import express from 'express';
import { 
  createBlogPost, 
  getAllBlogPosts, 
  getPublishedBlogPosts,
  getBlogPostById, 
  getBlogPostBySlug,
  updateBlogPost, 
  deleteBlogPost, 
  getBlogStats 
} from '../controllers/blogController';
import { validateBlog } from '../middleware/validation';
import { validateErrors } from '../middleware/validateErrors';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Публичные роуты
router.get('/published', getPublishedBlogPosts);
router.get('/slug/:slug', getBlogPostBySlug);

// Админские роуты
router.get('/', authenticateToken, requireAdmin, getAllBlogPosts);
router.get('/stats', authenticateToken, requireAdmin, getBlogStats);
router.get('/:id', authenticateToken, requireAdmin, getBlogPostById);
router.post('/', authenticateToken, requireAdmin, validateBlog, validateErrors, createBlogPost);
router.put('/:id', authenticateToken, requireAdmin, validateBlog, validateErrors, updateBlogPost);
router.delete('/:id', authenticateToken, requireAdmin, deleteBlogPost);

export default router;
