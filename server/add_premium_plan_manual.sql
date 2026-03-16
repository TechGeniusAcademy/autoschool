-- Добавление премиум плана в базу данных
-- Выполните этот скрипт в вашем MySQL клиенте

-- Проверяем, существует ли уже премиум план
SELECT COUNT(*) as existing_premium_plans FROM price_plans WHERE title = 'Премиум';

-- Если премиум плана нет, добавляем его
INSERT IGNORE INTO price_plans (
    category_id,
    title,
    price,
    duration,
    lessons_count,
    description,
    is_popular,
    is_active,
    sort_order
) VALUES (
    1, -- Категория B (легковые автомобили)
    'Премиум',
    60000.00,
    '3 месяца',
    68,
    'Расширенный курс с дополнительными часами практики',
    1, -- популярный план
    1, -- активен
    1  -- первый по сортировке
);

-- Получаем ID созданного плана
SET @premium_plan_id = (SELECT id FROM price_plans WHERE title = 'Премиум' LIMIT 1);

-- Добавляем особенности премиум плана
INSERT IGNORE INTO price_plan_features (plan_id, feature_text, sort_order) VALUES
(@premium_plan_id, 'Теоретический курс - 134 часа', 1),
(@premium_plan_id, 'Практические занятия - 68 часов', 2),
(@premium_plan_id, 'Индивидуальный график занятий', 3),
(@premium_plan_id, 'Вождение на премиум-автомобилях', 4),
(@premium_plan_id, 'Дополнительные часы вождения', 5),
(@premium_plan_id, 'Учебные материалы премиум-класса', 6),
(@premium_plan_id, 'Персональный инструктор', 7),
(@premium_plan_id, 'Топливный сбор включен', 8),
(@premium_plan_id, 'Внутренние экзамены', 9);

-- Проверяем результат
SELECT 
    pp.id,
    pp.title,
    pp.price,
    pp.duration,
    pp.lessons_count,
    pp.description,
    pc.category_name
FROM price_plans pp
JOIN price_categories pc ON pp.category_id = pc.id
WHERE pp.title = 'Премиум';

SELECT 
    ppf.feature_text
FROM price_plan_features ppf
JOIN price_plans pp ON ppf.plan_id = pp.id
WHERE pp.title = 'Премиум'
ORDER BY ppf.sort_order;
