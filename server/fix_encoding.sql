-- Удаляем поврежденные данные и добавляем правильные
USE autoshkola_db;

-- Отключаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 0;

-- Удаляем все планы и категории
DELETE FROM price_plans;
DELETE FROM price_categories;

-- Включаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 1;

-- Сбрасываем AUTO_INCREMENT
ALTER TABLE price_categories AUTO_INCREMENT = 1;
ALTER TABLE price_plans AUTO_INCREMENT = 1;

-- Добавляем категории в правильной кодировке (указываем id явно)
INSERT INTO price_categories (id, name, icon, description, sort_order, is_active) VALUES
(1, 'Категория B', 'FaCar', 'Легковые автомобили', 1, 1),
(2, 'Категория A', 'FaMotorcycle', 'Мотоциклы', 2, 1),
(3, 'Категория C', 'FaTruck', 'Грузовые автомобили', 3, 1);

-- Добавляем планы
INSERT INTO price_plans 
(category_id, title, price, duration, lessons_count, description, features, is_popular, is_active, sort_order) 
VALUES 
(1, 'Премиум', 60000.00, '3 месяца', 68, 'Расширенный курс с дополнительными часами практики', 
 JSON_ARRAY('68 занятий', 'Индивидуальный подход', 'Дополнительные часы практики', 'Приоритетная запись', 'Гарантия качества'), 
 1, 1, 1),
(1, 'Базовый', 45000.00, '2 месяца', 40, 'Стандартный курс обучения', 
 JSON_ARRAY('40 занятий', 'Теоретические занятия', 'Практическое вождение', 'Подготовка к экзамену'), 
 0, 1, 2),
(1, 'Стандарт', 55000.00, '2.5 месяца', 50, 'Расширенный курс с дополнительной практикой', 
 JSON_ARRAY('50 занятий', 'Дополнительные часы практики', 'Индивидуальные консультации', 'Экзаменационная подготовка'), 
 0, 1, 3);
