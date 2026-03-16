import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { CreateContactMessageData, ContactMessage } from '../models/ContactMessage';

// Создание нового сообщения обратной связи
export const createContactMessage = async (req: Request, res: Response) => {
  try {
    console.log("Contact message request body:", req.body);
    
    // Проверяем валидацию
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Contact message validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message }: CreateContactMessageData = req.body;

    // Сохраняем сообщение в базу данных
    const [result] = await pool.execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, subject, message]
    );

    const insertResult = result as any;
    const messageId = insertResult.insertId;

    console.log("Contact message created with ID:", messageId);

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will contact you soon.',
      data: {
        id: messageId
      }
    });

  } catch (error) {
    console.error('Contact message creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// Получение всех сообщений (только для админов)
export const getAllContactMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const filter = req.query.filter as string || 'all'; // all, unread, read

    console.log('Get messages params:', { page, limit, filter, offset });
    console.log('Param types:', { 
      pageType: typeof page, 
      limitType: typeof limit, 
      offsetType: typeof offset 
    });

    // Сначала попробуем самый простой запрос
    const [messages] = await pool.execute(
      `SELECT * FROM contact_messages ORDER BY created_at DESC`
    );

    console.log('Found messages:', (messages as any[]).length);
    console.log('Messages data:', messages);

    // Получаем общее количество сообщений
    const totalMessages = (messages as any[]).length;
    console.log('Total messages:', totalMessages);

    const responseData = {
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total: totalMessages,
          totalPages: Math.ceil(totalMessages / limit)
        }
      }
    };

    console.log('Sending response:', JSON.stringify(responseData, null, 2));

    res.json(responseData);

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Получение сообщения по ID
export const getContactMessageById = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;

    const [messages] = await pool.execute(
      `SELECT cm.*, u.first_name, u.last_name 
       FROM contact_messages cm
       LEFT JOIN users u ON cm.responded_by = u.id
       WHERE cm.id = ?`,
      [messageId]
    );

    const messageArray = messages as ContactMessage[];

    if (messageArray.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: messageArray[0]
    });

  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Отметить сообщение как прочитанное
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;

    await pool.execute(
      'UPDATE contact_messages SET is_read = true WHERE id = ?',
      [messageId]
    );

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Ответить на сообщение
export const respondToMessage = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;
    const { admin_response } = req.body;
    const respondedBy = (req as any).user.id; // ID админа из middleware

    await pool.execute(
      `UPDATE contact_messages 
       SET admin_response = ?, responded_by = ?, responded_at = NOW(), is_read = true
       WHERE id = ?`,
      [admin_response, respondedBy, messageId]
    );

    res.json({
      success: true,
      message: 'Response added successfully'
    });

  } catch (error) {
    console.error('Respond to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

// Удаление сообщения
export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;

    const [result] = await pool.execute(
      'DELETE FROM contact_messages WHERE id = ?',
      [messageId]
    );

    const deleteResult = result as any;

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Получение статистики сообщений
export const getContactMessagesStats = async (req: Request, res: Response) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as \`read\`,
        SUM(CASE WHEN admin_response IS NOT NULL THEN 1 ELSE 0 END) as responded
      FROM contact_messages
    `);

    res.json({
      success: true,
      data: (stats as any[])[0]
    });

  } catch (error) {
    console.error('Get contact messages stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};
