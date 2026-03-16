USE autoshkola_db;

-- Проверяем существует ли поле avatar_url
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'autoshkola_db' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'avatar_url';

-- Добавляем поле avatar_url если его нет
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL AFTER password_hash;

-- Проверяем результат
DESCRIBE users;
