-- Таблица для категорий (A, B, C, D, E)
CREATE TABLE IF NOT EXISTS price_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(5) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица для тарифных планов
CREATE TABLE IF NOT EXISTS price_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) NULL,
  duration VARCHAR(50) NOT NULL,
  lessons_count INT NOT NULL,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES price_categories(id) ON DELETE CASCADE
);

-- Таблица для особенностей тарифных планов
CREATE TABLE IF NOT EXISTS price_plan_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  feature_text VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES price_plans(id) ON DELETE CASCADE
);

-- Таблица для дополнительных услуг
CREATE TABLE IF NOT EXISTS additional_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица для скидок и акций
CREATE TABLE IF NOT EXISTS discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  discount_value VARCHAR(50) NOT NULL,
  description TEXT,
  conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NULL,
  end_date DATE NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Вставляем данные по умолчанию для категорий
INSERT INTO price_categories (category_code, category_name, icon_name, sort_order) VALUES
('B', 'Категория B', 'FaCar', 1),
('A', 'Категория A', 'FaMotorcycle', 2),
('C', 'Категория C', 'FaTruck', 3),
('D', 'Категория D', 'FaBus', 4),
('E', 'Категория E', 'FaTrailer', 5);

-- Вставляем премиум план для категории B
INSERT INTO price_plans (category_id, title, price, duration, lessons_count, description, is_popular, is_active, sort_order) VALUES
(1, 'Премиум', 60000.00, '3 месяца', 68, 'Расширенный курс с дополнительными часами практики', 1, 1, 1);

-- Вставляем особенности премиум плана
INSERT INTO price_plan_features (plan_id, feature_text, sort_order) VALUES
(1, 'Теоретический курс - 134 часа', 1),
(1, 'Практические занятия - 68 часов', 2),
(1, 'Индивидуальный график занятий', 3),
(1, 'Вождение на премиум-автомобилях', 4),
(1, 'Дополнительные часы вождения', 5),
(1, 'Учебные материалы премиум-класса', 6),
(1, 'Персональный инструктор', 7),
(1, 'Топливный сбор включен', 8),
(1, 'Внутренние экзамены', 9);
