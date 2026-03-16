-- Очистка некорректного avatar_url для инструктора
UPDATE users 
SET avatar_url = NULL 
WHERE avatar_url LIKE '%avatar-7-1756977659148-722204302.jpeg%';
