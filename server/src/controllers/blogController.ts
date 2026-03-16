import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Вспомогательная функция для безопасного парсинга тегов
const safeParseTags = (tags: any, postId?: number): string[] => {
  if (!tags) return [];
  
  try {
    return JSON.parse(tags);
  } catch (error) {
    console.warn(`Invalid JSON in tags for post ${postId || 'unknown'}:`, tags);
    // Если это строка, пытаемся разбить по запятым
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  }
};

// Интерфейс для блог поста
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_id: number;
  status: 'draft' | 'published' | 'archived';
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для расширенного Request с пользователем
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

// Создание блог поста
export const createBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Creating blog post with data:', req.body);
    
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status = 'draft',
      meta_title,
      meta_description,
      tags
    } = req.body;

    const author_id = req.user?.id;
    console.log('Author ID:', author_id);

    if (!author_id) {
      res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
      return;
    }

    // Проверяем уникальность slug
    console.log('Checking slug uniqueness for:', slug);
    const [existingPost] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [slug]
    );

    if (existingPost.length > 0) {
      console.log('Slug already exists');
      res.status(400).json({ success: false, message: 'Пост с таким slug уже существует' });
      return;
    }

    const published_at = status === 'published' ? new Date() : null;
    console.log('Published at:', published_at);

    console.log('Inserting blog post into database...');
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image, 
        author_id, \`status\`, meta_title, meta_description, 
        tags, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt,
        content,
        featured_image,
        author_id,
        status,
        meta_title,
        meta_description,
        JSON.stringify(tags || []),
        published_at
      ]
    );

    console.log('Blog post inserted with ID:', result.insertId);

    const [newPost] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [result.insertId]
    );

    console.log('Retrieved new post:', newPost[0]);

    res.status(201).json({
      success: true,
      message: 'Блог пост создан успешно',
      data: newPost[0]
    });
  } catch (error) {
    console.error('Ошибка при создании блог поста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение всех блог постов
export const getAllBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting all blog posts with query:', req.query);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = `
      SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.content, bp.featured_image, 
             bp.author_id, bp.status, bp.meta_title, bp.meta_description, bp.tags, 
             bp.view_count, bp.published_at, bp.created_at, bp.updated_at,
             u.first_name, u.last_name, u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
    `;
    const params: any[] = [];

    const conditions: string[] = [];

    if (status) {
      conditions.push('bp.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(bp.title LIKE ? OR bp.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY bp.created_at DESC';
    
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    
    // Используем прямую подстановку для LIMIT и OFFSET чтобы избежать проблем с параметрами
    query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

    console.log('Query:', query);
    console.log('Params:', params);
    console.log('Limit type:', typeof limitNum, 'Offset type:', typeof offsetNum);

    const [posts] = await pool.execute<RowDataPacket[]>(query, params);
    console.log('Found posts:', posts.length);

    // Подсчет общего количества постов
    let countQuery = 'SELECT COUNT(*) as total FROM blog_posts bp';
    const countParams: any[] = [];

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      if (status) countParams.push(status);
      if (search) countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        posts: posts.map(post => {
          let tags = [];
          try {
            tags = post.tags ? JSON.parse(post.tags) : [];
          } catch (error) {
            console.warn(`Invalid JSON in tags for post ${post.id}:`, post.tags);
            // Если это строка, пытаемся разбить по запятым
            if (typeof post.tags === 'string') {
              tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
          }
          
          return {
            ...post,
            author_name: `${post.first_name || ''} ${post.last_name || ''}`.trim(),
            tags: tags
          };
        }),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении блог постов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение блог поста по slug
export const getBlogPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const [posts] = await pool.execute<RowDataPacket[]>(
      `SELECT bp.*, 
              CONCAT(u.first_name, ' ', u.last_name) as author_name, 
              u.email as author_email
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ?`,
      [slug]
    );

    if (posts.length === 0) {
      res.status(404).json({ success: false, message: 'Блог пост не найден' });
      return;
    }

    const post = posts[0];

    // Увеличиваем счетчик просмотров
    await pool.execute(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = ?',
      [slug]
    );

    // Безопасная обработка тегов
    const tags = safeParseTags(post.tags, post.id);

    res.json({
      success: true,
      data: {
        ...post,
        tags: tags
      }
    });
  } catch (error) {
    console.error('Ошибка при получении блог поста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Обновление блог поста
export const updateBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
      meta_title,
      meta_description,
      tags
    } = req.body;

    // Проверяем, существует ли пост
    const [existingPosts] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );

    if (existingPosts.length === 0) {
      res.status(404).json({ success: false, message: 'Блог пост не найден' });
      return;
    }

    const existingPost = existingPosts[0];

    // Проверяем уникальность slug (если он изменился)
    if (slug && slug !== existingPost.slug) {
      const [slugCheck] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (slugCheck.length > 0) {
        res.status(400).json({ success: false, message: 'Пост с таким slug уже существует' });
        return;
      }
    }

    const published_at = status === 'published' && existingPost.status !== 'published' 
      ? new Date() 
      : existingPost.published_at;

    await pool.execute(
      `UPDATE blog_posts SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        excerpt = COALESCE(?, excerpt),
        content = COALESCE(?, content),
        featured_image = COALESCE(?, featured_image),
        \`status\` = COALESCE(?, \`status\`),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        tags = COALESCE(?, tags),
        published_at = COALESCE(?, published_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status,
        meta_title,
        meta_description,
        tags ? JSON.stringify(tags) : null,
        published_at,
        id
      ]
    );

    const [updatedPosts] = await pool.execute<RowDataPacket[]>(
      `SELECT bp.*, 
              CONCAT(u.first_name, ' ', u.last_name) as author_name, 
              u.email as author_email
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Блог пост обновлен успешно',
      data: {
        ...updatedPosts[0],
        tags: safeParseTags(updatedPosts[0].tags, updatedPosts[0].id)
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении блог поста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Удаление блог поста
export const deleteBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [existingPosts] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );

    if (existingPosts.length === 0) {
      res.status(404).json({ success: false, message: 'Блог пост не найден' });
      return;
    }

    await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Блог пост удален успешно'
    });
  } catch (error) {
    console.error('Ошибка при удалении блог поста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение блог поста по ID
export const getBlogPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [posts] = await pool.execute<RowDataPacket[]>(
      `SELECT bp.*, 
              CONCAT(u.first_name, ' ', u.last_name) as author_name, 
              u.email as author_email
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      res.status(404).json({ success: false, message: 'Блог пост не найден' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...posts[0],
        tags: safeParseTags(posts[0].tags, posts[0].id)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении блог поста:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение только опубликованных блог постов
export const getPublishedBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Getting published blog posts with query:', req.query);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    console.log('Parsed values:', { page, limit, search, offset });

    let query = `
      SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.content, bp.featured_image, 
             bp.author_id, bp.status, bp.meta_title, bp.meta_description, bp.tags, 
             bp.view_count, bp.published_at, bp.created_at, bp.updated_at,
             u.first_name, u.last_name, u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (bp.title LIKE ? OR bp.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY bp.published_at DESC';
    
    const limitNum = Number(limit);
    const offsetNum = Number(offset);
    
    // Используем прямую подстановку для LIMIT и OFFSET чтобы избежать проблем с параметрами
    query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

    console.log('Published posts query:', query);
    console.log('Published posts params:', params);
    console.log('Limit type:', typeof limitNum, 'Offset type:', typeof offsetNum);

    const [posts] = await pool.execute<RowDataPacket[]>(query, params);

    // Подсчет общего количества опубликованных постов
    let countQuery = 'SELECT COUNT(*) as total FROM blog_posts WHERE status = "published"';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        posts: posts.map(post => {
          let tags = [];
          try {
            tags = post.tags ? JSON.parse(post.tags) : [];
          } catch (error) {
            console.warn(`Invalid JSON in tags for post ${post.id}:`, post.tags);
            // Если это строка, пытаемся разбить по запятым
            if (typeof post.tags === 'string') {
              tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
          }
          
          return {
            ...post,
            author_name: `${post.first_name || ''} ${post.last_name || ''}`.trim(),
            tags: tags
          };
        }),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка при получении опубликованных блог постов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};

// Получение статистики блогов
export const getBlogStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalPosts] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM blog_posts'
    );

    const [publishedPosts] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as published FROM blog_posts WHERE status = "published"'
    );

    const [draftPosts] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as drafts FROM blog_posts WHERE status = "draft"'
    );

    const [totalViews] = await pool.execute<RowDataPacket[]>(
      'SELECT SUM(view_count) as total_views FROM blog_posts'
    );

    const [recentPosts] = await pool.execute<RowDataPacket[]>(
      `SELECT bp.title, bp.slug, bp.view_count, bp.created_at, 
              CONCAT(u.first_name, ' ', u.last_name) as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ORDER BY bp.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalPosts: totalPosts[0].total,
        publishedPosts: publishedPosts[0].published,
        draftPosts: draftPosts[0].drafts,
        totalViews: totalViews[0].total_views || 0,
        recentPosts
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики блогов:', error);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
};
