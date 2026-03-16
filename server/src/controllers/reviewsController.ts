import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Review extends RowDataPacket {
  id: number;
  user_id: number;
  course_id?: number;
  reason?: string;
  author_name: string;
  author_email: string;
  author_phone?: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
}

// Получение всех одобренных отзывов для публичной страницы
export const getPublicReviews = async (req: Request, res: Response) => {
  try {
    const { 
      sort = 'newest', 
      rating = null, 
      reason = null,
      limit = 50,
      offset = 0 
    } = req.query;

    const userId = req.user?.id; // Получаем ID пользователя если он авторизован

    let orderBy = 'r.created_at DESC';
    switch (sort) {
      case 'oldest':
        orderBy = 'r.created_at ASC';
        break;
      case 'highest':
        orderBy = 'r.rating DESC, r.created_at DESC';
        break;
      case 'lowest':
        orderBy = 'r.rating ASC, r.created_at DESC';
        break;
      case 'likes':
        orderBy = 'r.likes_count DESC, r.created_at DESC';
        break;
    }

    let whereConditions = ['r.is_approved = 1'];
    const filterParams: any[] = [];

    if (rating) {
      whereConditions.push('r.rating = ?');
      filterParams.push(parseInt(rating as string));
    }

    if (reason) {
      whereConditions.push('r.reason = ?');
      filterParams.push(reason as string);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        r.*,
        u.avatar_url,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), r.author_name, 'Гость') as display_name,
        ${userId ? `(SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ?) > 0` : 'false'} as is_liked_by_user
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      ${whereClause} 
      ORDER BY ${orderBy} 
      LIMIT ${parseInt(limit as string)} 
      OFFSET ${parseInt(offset as string)}
    `;

    const queryParams = userId ? [userId, ...filterParams] : [...filterParams];

    const [reviews] = await pool.execute<Review[]>(query, queryParams);

    // Получаем общее количество для пагинации
    const countQuery = `SELECT COUNT(*) as total FROM reviews r ${whereClause}`;

    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery, 
      filterParams // используем только параметры фильтрации, без limit и offset
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        reviews,
        total,
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total
      }
    });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении отзывов'
    });
  }
};

// Получение всех отзывов для админ-панели
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    console.log('getAllReviews called with query:', req.query);
    console.log('User:', req.user);
    
    const { 
      sort = 'newest', 
      status = 'all',
      limit = 50,
      offset = 0 
    } = req.query;

    const userId = req.user?.id; // Получаем ID пользователя

    let orderBy = 'r.created_at DESC';
    switch (sort) {
      case 'oldest':
        orderBy = 'r.created_at ASC';
        break;
      case 'rating_high':
        orderBy = 'r.rating DESC, r.created_at DESC';
        break;
      case 'rating_low':
        orderBy = 'r.rating ASC, r.created_at DESC';
        break;
    }

    let whereConditions: string[] = [];
    const filterParams: any[] = [];

    if (status === 'approved') {
      whereConditions.push('r.is_approved = ?');
      filterParams.push(true);
    } else if (status === 'pending') {
      whereConditions.push('r.is_approved = ?');
      filterParams.push(false);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const limitValue = Number(limit) || 50;
    const offsetValue = Number(offset) || 0;

    const query = `
      SELECT 
        r.*,
        c.title as course_title,
        u.avatar_url,
        CONCAT(u.first_name, ' ', u.last_name) as user_full_name,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), r.author_name, 'Гость') as display_name,
        ${userId ? `(SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.user_id = ?) > 0` : 'false'} as is_liked_by_user
      FROM reviews r
      LEFT JOIN courses c ON r.course_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limitValue} OFFSET ${offsetValue}
    `;

    const queryParams = userId ? [userId, ...filterParams] : [...filterParams];
    
    console.log('Executing query:', query);
    console.log('Query params:', queryParams);

    const [reviews] = await pool.execute<Review[]>(query, queryParams);
    console.log('Found reviews:', reviews.length);

    // Получаем статистику
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_approved = true THEN 1 END) as approved,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending,
        AVG(rating) as average_rating
      FROM reviews
    `;

    const [statsResult] = await pool.execute<RowDataPacket[]>(statsQuery);
    const stats = statsResult[0];
    console.log('Stats:', stats);

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          total: stats.total,
          approved: stats.approved,
          pending: stats.pending,
          averageRating: Math.round(stats.average_rating * 10) / 10
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении отзывов'
    });
  }
};

// Создание нового отзыва
export const createReview = async (req: Request, res: Response) => {
  try {
    const { 
      reason, 
      rating, 
      comment 
    } = req.body;

    // Проверяем авторизацию
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация для создания отзыва'
      });
    }

    // Валидация
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Рейтинг и комментарий обязательны'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Рейтинг должен быть от 1 до 5'
      });
    }

    // Получаем данные пользователя
    const user_id = req.user.id;
    const author_name = `${req.user.firstName} ${req.user.lastName}`;
    const author_email = req.user.email;

    const query = `
      INSERT INTO reviews (
        user_id, course_id, reason, author_name, author_email, author_phone, 
        rating, comment, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      user_id,
      null, // course_id теперь всегда null
      reason || null,
      author_name,
      author_email,
      null, // author_phone
      rating,
      comment,
      true // Всегда верифицируем для авторизованных пользователей
    ]);

    res.status(201).json({
      success: true,
      message: 'Отзыв успешно отправлен на модерацию',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании отзыва'
    });
  }
};

// Обновление статуса отзыва (одобрение/отклонение)
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const query = `
      UPDATE reviews 
      SET is_approved = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [is_approved, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Отзыв не найден'
      });
    }

    res.json({
      success: true,
      message: is_approved ? 'Отзыв одобрен' : 'Отзыв отклонен'
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса отзыва'
    });
  }
};

// Удаление отзыва
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM reviews WHERE id = ?';
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Отзыв не найден'
      });
    }

    res.json({
      success: true,
      message: 'Отзыв удален'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении отзыва'
    });
  }
};

// Обновление количества лайков
export const updateReviewLikes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Проверяем, лайкал ли пользователь этот отзыв
    const [existingLike] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM review_likes WHERE user_id = ? AND review_id = ?',
      [userId, id]
    );

    let isLiked = false;
    let likesCount = 0;

    if (existingLike.length > 0) {
      // Убираем лайк
      await pool.execute(
        'DELETE FROM review_likes WHERE user_id = ? AND review_id = ?',
        [userId, id]
      );
      
      // Уменьшаем счетчик лайков
      await pool.execute(
        'UPDATE reviews SET likes_count = likes_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      isLiked = false;
    } else {
      // Добавляем лайк
      await pool.execute(
        'INSERT INTO review_likes (user_id, review_id) VALUES (?, ?)',
        [userId, id]
      );
      
      // Увеличиваем счетчик лайков
      await pool.execute(
        'UPDATE reviews SET likes_count = likes_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      
      isLiked = true;
    }

    // Получаем обновленное количество лайков
    const [reviewResult] = await pool.execute<RowDataPacket[]>(
      'SELECT likes_count FROM reviews WHERE id = ?',
      [id]
    );

    if (reviewResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Отзыв не найден'
      });
    }

    likesCount = reviewResult[0].likes_count;

    res.json({
      success: true,
      data: { 
        likes_count: likesCount,
        is_liked_by_user: isLiked
      }
    });
  } catch (error) {
    console.error('Error updating review likes:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении лайков'
    });
  }
};

// Получение статистики отзывов
export const getReviewsStats = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_reviews,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
    `;

    const [result] = await pool.execute<RowDataPacket[]>(query);
    const stats = result[0];

    res.json({
      success: true,
      data: {
        totalReviews: stats.total_reviews,
        approvedReviews: stats.approved_reviews,
        pendingReviews: stats.pending_reviews,
        averageRating: Math.round(stats.average_rating * 10) / 10,
        ratingDistribution: {
          5: stats.five_star,
          4: stats.four_star,
          3: stats.three_star,
          2: stats.two_star,
          1: stats.one_star
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики отзывов'
    });
  }
};
