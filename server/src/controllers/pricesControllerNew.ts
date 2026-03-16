import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Интерфейсы под существующую структуру БД
interface PriceCategory extends RowDataPacket {
  id: string;
  name: string;
  icon: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

interface PricePlan extends RowDataPacket {
  id: number;
  category_id: number;
  title: string;
  price: number;
  old_price?: number;
  duration: string;
  lessons_count: number;
  description?: string;
  features?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface PriceItem extends RowDataPacket {
  id: string;
  title: string;
  category_id: string;
  price: number;
  old_price?: number;
  duration: string;
  lessons: number;
  features: string;
  popular: boolean;
  description: string;
  sort_order: number;
  is_active: boolean;
}

interface AdditionalService extends RowDataPacket {
  id: number;
  title: string;
  price: number;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface PriceDiscount extends RowDataPacket {
  id: number;
  title: string;
  discount_value: string;
  description?: string;
  conditions?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  sort_order: number;
}

// =================== КАТЕГОРИИ ЦЕН ===================
export const getPriceCategories = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<PriceCategory[]>(
      'SELECT * FROM price_categories ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Ошибка получения категорий цен:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения категорий цен'
    });
  }
};

export const createPriceCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, description, sort_order = 0, is_active = true } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO price_categories (name, icon, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, icon, description, sort_order, is_active]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, name, icon, description, sort_order, is_active },
      message: 'Категория успешно создана'
    });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания категории'
    });
  }
};

export const updatePriceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, description, sort_order, is_active } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE price_categories SET name = ?, icon = ?, description = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, icon, description, sort_order, is_active, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Категория успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления категории'
    });
  }
};

export const deletePriceCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM price_categories WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Категория успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления категории'
    });
  }
};

// =================== ТАРИФНЫЕ ПЛАНЫ ===================
export const getPricePlans = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<PricePlan[]>(
      'SELECT * FROM price_plans ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Ошибка получения тарифных планов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения тарифных планов'
    });
  }
};

export const createPricePlan = async (req: Request, res: Response) => {
  try {
    console.log('=== Создание тарифного плана ===');
    console.log('Полученные данные:', req.body);
    
    const { 
      category_id, title, price, old_price, duration, lessons_count, 
      description, features, is_popular = false, sort_order = 0 
    } = req.body;
    
    console.log('Извлеченные параметры:');
    console.log('category_id:', category_id, typeof category_id);
    console.log('title:', title);
    console.log('price:', price);
    console.log('features:', features);
    
    // Проверяем, существует ли категория
    console.log('Проверяем категорию с ID:', category_id);
    
    // Сначала получим все категории для отладки
    const [allCategories] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name FROM price_categories'
    );
    console.log('Все доступные категории:', allCategories);
    
    const [categoryExists] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM price_categories WHERE id = ?',
      [category_id]
    );
    
    console.log('Найдено категорий:', categoryExists.length);
    console.log('Категории:', categoryExists);
    
    if (categoryExists.length === 0) {
      console.log('Категория не найдена!');
      return res.status(400).json({
        success: false,
        message: `Категория цен с ID ${category_id} не найдена. Доступные категории: ${allCategories.map(c => `${c.id}:${c.name}`).join(', ')}`
      });
    }
    
    console.log('Категория найдена, создаем тарифный план...');
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO price_plans 
       (category_id, title, price, old_price, duration, lessons_count, description, features, is_popular, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, title, price, old_price, duration, lessons_count, description, JSON.stringify(features), is_popular, sort_order]
    );
    
    console.log('Тарифный план создан успешно, ID:', result.insertId);
    
    res.json({
      success: true,
      data: { id: result.insertId, ...req.body },
      message: 'Тарифный план успешно создан'
    });
  } catch (error) {
    console.error('Ошибка создания тарифного плана:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания тарифного плана'
    });
  }
};

export const updatePricePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      category_id, title, price, old_price, duration, lessons_count, 
      description, features, is_popular, is_active, sort_order 
    } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE price_plans SET 
       category_id = ?, title = ?, price = ?, old_price = ?, duration = ?, 
       lessons_count = ?, description = ?, features = ?, is_popular = ?, 
       is_active = ?, sort_order = ? 
       WHERE id = ?`,
      [category_id, title, price, old_price, duration, lessons_count, description, JSON.stringify(features), is_popular, is_active, sort_order, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Тарифный план не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Тарифный план успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка обновления тарифного плана:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления тарифного плана'
    });
  }
};

export const deletePricePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM price_plans WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Тарифный план не найден'
      });
    }
    
    res.json({
      success: true,
      message: 'Тарифный план успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления тарифного плана:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления тарифного плана'
    });
  }
};

// =================== ЦЕНЫ (PRICE_ITEMS) ===================
export const getPriceItems = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<PriceItem[]>(
      'SELECT * FROM price_items ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Ошибка получения цен:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения цен'
    });
  }
};

// =================== ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ ===================
export const getAdditionalServices = async (req: Request, res: Response) => {
  try {
    // Создаем таблицу если не существует
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS additional_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    const [rows] = await pool.execute<AdditionalService[]>(
      'SELECT * FROM additional_services ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Ошибка получения дополнительных услуг:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения дополнительных услуг'
    });
  }
};

export const createAdditionalService = async (req: Request, res: Response) => {
  try {
    const { title, price, description, sort_order = 0 } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO additional_services (title, price, description, sort_order) VALUES (?, ?, ?, ?)',
      [title, price, description, sort_order]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, ...req.body },
      message: 'Дополнительная услуга успешно создана'
    });
  } catch (error) {
    console.error('Ошибка создания дополнительной услуги:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания дополнительной услуги'
    });
  }
};

export const updateAdditionalService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, price, description, is_active, sort_order } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE additional_services SET title = ?, price = ?, description = ?, is_active = ?, sort_order = ? WHERE id = ?',
      [title, price, description, is_active, sort_order, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Дополнительная услуга не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Дополнительная услуга успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка обновления дополнительной услуги:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления дополнительной услуги'
    });
  }
};

export const deleteAdditionalService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM additional_services WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Дополнительная услуга не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Дополнительная услуга успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления дополнительной услуги:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления дополнительной услуги'
    });
  }
};

// =================== СКИДКИ ===================
export const getPriceDiscounts = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<PriceDiscount[]>(
      'SELECT * FROM price_discounts ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Ошибка получения скидок:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения скидок'
    });
  }
};

export const createPriceDiscount = async (req: Request, res: Response) => {
  try {
    const { 
      title, discount_value, description, conditions, 
      start_date, end_date, sort_order = 0 
    } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO price_discounts 
       (title, discount_value, description, conditions, start_date, end_date, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, discount_value, description, conditions, start_date, end_date, sort_order]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, ...req.body },
      message: 'Скидка успешно создана'
    });
  } catch (error) {
    console.error('Ошибка создания скидки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания скидки'
    });
  }
};

export const updatePriceDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, discount_value, description, conditions, 
      is_active, start_date, end_date, sort_order 
    } = req.body;
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE price_discounts SET 
       title = ?, discount_value = ?, description = ?, conditions = ?, 
       is_active = ?, start_date = ?, end_date = ?, sort_order = ? 
       WHERE id = ?`,
      [title, discount_value, description, conditions, is_active, start_date, end_date, sort_order, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Скидка не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Скидка успешно обновлена'
    });
  } catch (error) {
    console.error('Ошибка обновления скидки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления скидки'
    });
  }
};

export const deletePriceDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM price_discounts WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Скидка не найдена'
      });
    }
    
    res.json({
      success: true,
      message: 'Скидка успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления скидки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления скидки'
    });
  }
};

// =================== ПУБЛИЧНЫЙ API ДЛЯ СТРАНИЦЫ ЦЕН ===================
export const getPublicPrices = async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.execute<PriceCategory[]>(
      'SELECT * FROM price_categories WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    
    const [plans] = await pool.execute<PricePlan[]>(
      'SELECT * FROM price_plans WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    
    let services: AdditionalService[] = [];
    try {
      const [servicesResult] = await pool.execute<AdditionalService[]>(
        'SELECT * FROM additional_services WHERE is_active = 1 ORDER BY sort_order ASC'
      );
      services = servicesResult;
    } catch (error) {
      console.log('Таблица additional_services не существует');
    }
    
    const [discounts] = await pool.execute<PriceDiscount[]>(
      'SELECT * FROM price_discounts WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    
    res.json({
      success: true,
      data: {
        categories,
        plans,
        services,
        discounts
      }
    });
  } catch (error) {
    console.error('Ошибка получения публичных цен:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения данных о ценах'
    });
  }
};
