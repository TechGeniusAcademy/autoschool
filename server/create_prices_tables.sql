-- Таблица категорий цен
CREATE TABLE IF NOT EXISTS price_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'FaCar',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица тарифных планов
CREATE TABLE IF NOT EXISTS price_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) NULL,
  duration VARCHAR(50) NOT NULL,
  lessons_count INT NOT NULL,
  description TEXT NULL,
  features JSON NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_id (category_id)
);

-- Таблица дополнительных услуг
CREATE TABLE IF NOT EXISTS additional_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица скидок
CREATE TABLE IF NOT EXISTS price_discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  discount_value VARCHAR(50) NOT NULL,
  description TEXT NULL,
  conditions TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NULL,
  end_date DATE NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица настроек цен
CREATE TABLE IF NOT EXISTS price_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Вставляем базовые категории
INSERT IGNORE INTO price_categories (category_code, category_name, icon_name, sort_order) VALUES
('car', 'Категория B (Легковые автомобили)', 'FaCar', 1),
('motorcycle', 'Категория A (Мотоциклы)', 'FaMotorcycle', 2),
('truck', 'Категория C (Грузовые автомобили)', 'FaTruck', 3),
('bus', 'Категория D (Автобусы)', 'FaBus', 4),
('trailer', 'Категория E (Прицепы)', 'FaTrailer', 5);

-- Вставляем базовые тарифные планы
INSERT IGNORE INTO price_plans (category_id, title, price, duration, lessons_count, description, features, is_popular, sort_order) VALUES
(1, 'Стандартный курс', 25000.00, '3 месяца', 56, 'Базовый курс обучения вождению', JSON_ARRAY('Теоретические занятия', 'Практическое вождение', 'Подготовка к экзамену', 'Помощь в ГИБДД'), FALSE, 1),
(1, 'Интенсивный курс', 35000.00, '1.5 месяца', 56, 'Ускоренный курс обучения', JSON_ARRAY('Теоретические занятия', 'Практическое вождение', 'Индивидуальные занятия', 'Подготовка к экзамену', 'Помощь в ГИБДД'), TRUE, 2),
(1, 'VIP курс', 45000.00, '2 месяца', 64, 'Премиум обучение с индивидуальным подходом', JSON_ARRAY('Индивидуальные теоретические занятия', 'Практическое вождение', 'Личный инструктор', 'Гибкий график', 'Сопровождение в ГИБДД'), FALSE, 3);

-- Вставляем дополнительные услуги
INSERT IGNORE INTO additional_services (title, price, description, sort_order) VALUES
('Дополнительное занятие по вождению', 1500.00, 'Дополнительная практика вождения с инструктором', 1),
('Повторная пересдача внутреннего экзамена', 1000.00, 'Повторная попытка сдачи экзамена в автошколе', 2),
('Сопровождение в ГИБДД', 2000.00, 'Инструктор поедет с вами на экзамен в ГИБДД', 3),
('Индивидуальная теория', 800.00, 'Индивидуальное занятие по теории ПДД', 4);

-- Вставляем скидки
INSERT IGNORE INTO price_discounts (title, discount_value, description, conditions, sort_order) VALUES
('Скидка для студентов', '10%', 'Скидка для студентов очной формы обучения', 'При предъявлении студенческого билета', 1),
('Семейная скидка', '15%', 'Скидка при обучении членов одной семьи', 'При одновременном обучении двух и более членов семьи', 2),
('Скидка пенсионерам', '20%', 'Скидка для пенсионеров', 'При предъявлении пенсионного удостоверения', 3);
