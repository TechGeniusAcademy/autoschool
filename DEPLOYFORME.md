# 🚀 Полная пошаговая инструкция по деплою AutoSchool на Ubuntu

## 📋 Что вам понадобится

- **VPS/сервер** с Ubuntu 20.04 или новее
- **SSH доступ** к серверу (логин/пароль или SSH ключи)
- **Локальные файлы проекта** AutoSchool на вашем компьютере
- **Дамп базы данных** M# Создайте архив с проектом

# Способ 1: Через проводник Windows (БЫСТРЕЕ!)

# - Выделите папки client и server

# - Правый клик → "Отправить" → "Сжатая ZIP-папка"

# - Переименуйте в autoschool.zip

# Способ 2: Через WinRAR (если установлен)

# - Выделите папки client и server

# - Правый клик → "Добавить в архив..."

# - Назовите autoschool.zip или autoschool.rar

# Способ 3: Через PowerShell (с перезаписью)

Compress-Archive -Path client,server -DestinationPath autoschool.zip -Force

# Способ 4: Используйте 7zip если установлен

# 7z a autoschool.zip client serverго локального компьютера

**Важно:** Этот гайд предполагает деплой локальной версии проекта, а не из GitHub репозиториев.

---

## 🎯 ЭТАП 1: ПОДГОТОВКА СЕРВЕРА

### 1.1 Подключение к серверу

```bash
# Подключитесь к серверу через SSH
ssh root@YOUR_SERVER_IP
# или если у вас другой пользователь:
ssh username@YOUR_SERVER_IP
```

### 1.2 Обновление системы

```bash
# Обновляем пакеты
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые утилиты
sudo apt install -y curl wget git htop nano ufw
```

### 1.3 Создание пользователя для приложения

```bash
# Создаем пользователя (если работаете под root)
adduser autoschool
usermod -aG sudo autoschool

# Переключаемся на нового пользователя
su - autoschool
```

### 1.4 Настройка базовой безопасности

```bash
# Настраиваем firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Проверяем статус
sudo ufw status
```

---

## 🎯 ЭТАП 2: УСТАНОВКА ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ

### 2.1 Установка Node.js

```bash
# Устанавливаем Node.js версии 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверяем установку
node --version  # должно показать v18.x.x
npm --version   # должно показать 9.x.x или выше
```

### 2.2 Установка MySQL

```bash
# Устанавливаем MySQL
sudo apt install mysql-server -y

# Запускаем скрипт безопасной настройки
sudo mysql_secure_installation

# Отвечаем на вопросы:
# - Remove anonymous users? Y
# - Disallow root login remotely? Y
# - Remove test database? Y
# - Reload privilege tables? Y
```

### 2.3 Установка Nginx

```bash
# Устанавливаем Nginx
sudo apt install nginx -y

# Запускаем и добавляем в автозагрузку
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверяем статус
sudo systemctl status nginx
```

### 2.4 Установка PM2

```bash
# Устанавливаем PM2 глобально
sudo npm install -g pm2

# Настраиваем автозапуск PM2
pm2 startup
# Выполните команду, которую покажет PM2
```

---

## 🎯 ЭТАП 3: ПОЛНАЯ ПЕРЕУСТАНОВКА И НАСТРОЙКА MySQL

### 3.1 Полное удаление старого MySQL

```bash
# Остановите все процессы PM2 если есть
pm2 delete all

# Остановите MySQL
sudo systemctl stop mysql

# Полностью удалите MySQL
sudo apt-get remove --purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-*
sudo rm -rf /etc/mysql /var/lib/mysql
sudo apt-get autoremove
sudo apt-get autoclean
```

### 3.2 Установка MySQL заново

```bash
# Обновите пакеты
sudo apt update

# Установите MySQL
sudo apt install mysql-server -y

# Запустите MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 3.3 Настройка MySQL с минимальной защитой

```bash
# Войдите в MySQL как root
sudo mysql -u root

# В MySQL консоли выполните:
```

```sql
-- Установите пароль для root (если нужно)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root123';

-- Проверьте, установлена ли валидация паролей
SHOW VARIABLES LIKE 'validate_password%';

-- Если получите "Empty set", значит валидация паролей не установлена - это идеально!
-- Если переменные есть, выполните команды для их отключения:
-- UNINSTALL COMPONENT 'file://component_validate_password';
-- или
-- SET GLOBAL validate_password.policy=LOW;

-- Примените изменения
FLUSH PRIVILEGES;
EXIT;
```

### 3.4 Создание базы данных и пользователя

```bash
# Войдите снова в MySQL
mysql -u root -p
# Пароль: root123
```

```sql
-- Создайте базу данных
CREATE DATABASE autoshkola_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создайте пользователя как в .env файле
CREATE USER 'autoschool_user'@'localhost' IDENTIFIED BY 'AutoSchool!Database@2024#Strong';

-- Дайте все права
GRANT ALL PRIVILEGES ON autoshkola_db.* TO 'autoschool_user'@'localhost';
FLUSH PRIVILEGES;

-- Проверьте, что все создано
SHOW DATABASES;
SHOW GRANTS FOR 'autoschool_user'@'localhost';
EXIT;
```

### 3.5 Импорт базы данных с локального компьютера

**На вашем локальном компьютере (Windows):**

```powershell
# Способ 1: Найдите путь к mysqldump
# Обычно MySQL установлен в одну из этих папок:
# "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
# "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe"
# "C:\xampp\mysql\bin\mysqldump.exe" (если используете XAMPP)

# Проверьте, где установлен MySQL
dir "C:\Program Files\MySQL\" -ErrorAction SilentlyContinue
dir "C:\xampp\mysql\bin\" -ErrorAction SilentlyContinue

# Используйте полный путь для создания дампа (замените путь на свой):
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p autoshkola_db > autoshkola_backup.sql

# Способ 2: Если MySQL не найден, используйте phpMyAdmin или MySQL Workbench
# Экспортируйте базу данных autoshkola_db в файл autoshkola_backup.sql

# Загрузите дамп на сервер
scp autoshkola_backup.sql ubuntu@82.115.43.207:/tmp/
```

**На сервере Ubuntu:**

```bash
# Импортируйте дамп в базу данных
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db < /tmp/autoshkola_backup.sql

# Проверьте, что таблицы импортированы
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db -e "SHOW TABLES;"

# Удалите файл дампа
rm /tmp/autoshkola_backup.sql
```

---

## 🎯 ЭТАП 4: ОЧИСТКА И ПОДГОТОВКА СЕРВЕРА

### 4.1 Полная очистка старых файлов

```bash
# Остановите все процессы PM2
pm2 delete all
pm2 kill

# Удалите старые файлы проекта
sudo rm -rf /var/www/autoschool

# Остановите Nginx
sudo systemctl stop nginx

# Удалите старые конфигурации Nginx
sudo rm -f /etc/nginx/sites-enabled/autoschool
sudo rm -f /etc/nginx/sites-available/autoschool
```

### 4.2 Создание директории для проекта

```bash
# Создайте директорию для проекта
sudo mkdir -p /var/www/autoschool
sudo chown -R ubuntu:ubuntu /var/www/autoschool
cd /var/www/autoschool
```

---

## 🎯 ЭТАП 5: ЗАГРУЗКА ЛОКАЛЬНЫХ ФАЙЛОВ НА СЕРВЕР

### 5.1 Подготовка архива на локальном компьютере

**На Windows (PowerShell):**

```powershell
# Перейдите в папку проекта
cd "C:\Users\alkaw\OneDrive\Desktop\AutoSchool"

# Создайте архив с проектом
# Способ 1: Через проводник Windows (БЫСТРЕЕ!)
# - Выделите папки client и server
# - Правый клик → "Отправить" → "Сжатая ZIP-папка"
# - Переименуйте в autoschool.zip

# Способ 2: Через PowerShell (с перезаписью)
Compress-Archive -Path client,server -DestinationPath autoschool.zip -Force

# Способ 3: Используйте 7zip если установлен
# 7z a autoschool.zip client server
```

### 5.2 Загрузка файлов на сервер

```powershell
# Загрузите архив на сервер (ZIP или RAR)
scp autoschool.zip ubuntu@82.115.43.207:/tmp/
# или если создали RAR:
# scp autoschool.rar ubuntu@82.115.43.207:/tmp/
```

### 5.3 Распаковка на сервере

```bash
# На сервере Ubuntu распакуйте архив
cd /var/www/autoschool

# Установите unzip и unrar если нужно
sudo apt install unzip unrar -y

# Распакуйте архив (в зависимости от типа)
unzip /tmp/autoschool.zip
# или если загрузили RAR:
# unrar x /tmp/autoschool.rar

# Проверьте, что файлы загружены
ls -la
# Должны увидеть папки: client, server

# Удалите архив
rm /tmp/autoschool.zip
# или если был RAR:
# rm /tmp/autoschool.rar
```

---

## 🎯 ЭТАП 6: НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ

### 6.1 Настройка сервера

```bash
# Переходим в папку сервера
cd /var/www/autoschool/server

# Создайте .env файл (не копируйте из примера, создайте новый)
nano .env
```

Вставьте ТОЧНО следующие настройки в файл `.env`:

```env
# База данных (ТОЧНЫЕ настройки как созданы выше!)
DB_HOST=localhost
DB_USER=autoschool_user
DB_PASSWORD=AutoSchool!Database@2024#Strong
DB_NAME=autoshkola_db

# JWT секрет
JWT_SECRET=super_secret_jwt_key_make_it_very_long_and_random_123456789
JWT_EXPIRES_IN=7d

# Сервер
PORT=3001
NODE_ENV=production

# CORS (ваш IP без домена)
FRONTEND_URL=http://82.115.43.207

# Загрузка файлов
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5242880
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`.

### 6.2 Настройка клиента

```bash
# Переходим в папку клиента
cd /var/www/autoschool/client

# Создаем файл переменных окружения
nano .env.local
```

Вставьте следующие настройки:

```env
# API URLs (для IP адреса без SSL)
NEXT_PUBLIC_SERVER_URL=http://82.115.43.207
NEXT_PUBLIC_API_BASE_URL=http://82.115.43.207/api
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`.

---

## 🎯 ЭТАП 7: УСТАНОВКА ЗАВИСИМОСТЕЙ И СБОРКА

### 7.1 Сборка сервера

```bash
# Переходим в папку сервера
cd /var/www/autoschool/server

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

# Проверяем, что папка dist создалась
ls -la
```

### 7.2 Сборка клиента

```bash
# Переходим в папку клиента
cd /var/www/autoschool/client

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

# Проверяем, что папка .next создалась
ls -la
```

---

## 🎯 ЭТАП 8: НАСТРОЙКА NGINX

### 8.1 Создание конфигурации Nginx

```bash
# Создайте новую конфигурацию сайта
sudo nano /etc/nginx/sites-available/autoschool
```

Вставьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name 82.115.43.207;

    # Основное приложение Next.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js статические файлы
    location /_next/static/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js изображения
    location /_next/image {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # API сервер
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS заголовки
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Загрузки
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
        proxy_set_header Host $host;
    }

    # Максимальный размер файлов
    client_max_body_size 10M;
}
```

Сохраните файл: `Ctrl+X`, затем `Y`, затем `Enter`.

### 8.2 Активация конфигурации

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/autoschool /etc/nginx/sites-enabled/

# Удаляем дефолтный сайт
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl reload nginx
```

---

## 🎯 ЭТАП 9: НАСТРОЙКА PM2

### 9.1 Обновление конфигурации PM2

```bash
# Переходим в корень проекта
cd /var/www/autoschool

# Редактируем файл PM2
nano ecosystem.config.js
```

Убедитесь, что содержимое такое:

```javascript
module.exports = {
  apps: [
    {
      name: "autoschool-server",
      script: "dist/index.js",
      cwd: "/var/www/autoschool/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "autoschool-client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5000",
      cwd: "/var/www/autoschool/client",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
```

### 9.2 Запуск и проверка приложений

```bash
# Запустите приложения поэтапно

# Сначала только сервер
pm2 start ecosystem.config.js --only autoschool-server

# Проверьте логи сервера
pm2 logs autoschool-server --lines 20

# Если сервер запустился без ошибок, запустите клиент
pm2 start ecosystem.config.js --only autoschool-client

# Проверьте статус всех приложений
pm2 status

# Сохраните конфигурацию
pm2 save

# Настройте автозапуск PM2
pm2 startup
# Выполните команду, которую покажет PM2
```

---

## 🎯 ЭТАП 10: ФИНАЛЬНАЯ ПРОВЕРКА И ТЕСТИРОВАНИЕ

---

### 10.1 Проверка работоспособности

```bash
# Проверьте статус всех служб
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Проверьте, что порты слушаются
sudo netstat -tlnp | grep -E ':80|:3001|:5000'

# Проверьте подключение к базе данных
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db -e "SHOW TABLES;"
```

### 10.2 Тестирование API

```bash
# Проверьте, что API сервер отвечает
curl http://localhost:3001/api/health
curl http://localhost:3001/api/courses/public

# Проверьте через внешний IP
curl http://82.115.43.207/api/health
curl http://82.115.43.207/api/courses/public
```

### 10.3 Проверка логов

```bash
# Проверьте логи приложений
pm2 logs autoschool-server --lines 30
pm2 logs autoschool-client --lines 30

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.4 Тестирование в браузере

1. Откройте браузер и перейдите на `http://82.115.43.207`
2. Проверьте, что сайт загружается без ошибок
3. Откройте консоль разработчика (F12) и проверьте отсутствие ошибок
4. Попробуйте перейти на разные страницы сайта

### 10.5 Создание администратора (если нужно)

```bash
# Если в базе данных нет администратора, создайте его
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db

# В MySQL выполните:
```

```sql
-- Проверьте, есть ли таблица users
SHOW TABLES;
DESCRIBE users;

-- Если таблица есть, создайте администратора
INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, created_at, updated_at)
VALUES ('Admin', 'User', 'admin@autoschool.com', '$2a$10$rL1D3qLqEbVsKjfW3mGKj.VZ7e9h0aKLQSBGLFjGrV.lZGWzB4qP2', 'admin', 1, NOW(), NOW());

EXIT;
```

**Логин администратора:** `admin@autoschool.com`  
**Пароль:** `admin123`

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ

### Управление PM2

```bash
pm2 status                # Статус приложений
pm2 restart all          # Перезапуск всех приложений
pm2 stop all            # Остановка всех приложений
pm2 logs                # Просмотр логов
pm2 monit               # Мониторинг ресурсов
```

### Управление Nginx

```bash
sudo systemctl reload nginx    # Перезагрузка конфигурации
sudo systemctl restart nginx   # Полный перезапуск
sudo nginx -t                 # Проверка конфигурации
```

### Обновление приложения с локальными файлами

```bash
# Остановите приложения
pm2 stop all

# Создайте бэкап старой версии
sudo cp -r /var/www/autoschool /var/www/autoschool_backup_$(date +%Y%m%d)

# Загрузите новый архив с Windows на сервер:
# scp autoschool.zip ubuntu@82.115.43.207:/tmp/

# Удалите старые файлы
rm -rf /var/www/autoschool/client /var/www/autoschool/server

# Распакуйте новые файлы
cd /var/www/autoschool
unzip /tmp/autoschool.zip

# Пересоберите проекты
cd server && npm install && npm run build
cd ../client && npm install && npm run build

# Перезапустите приложения
pm2 restart all
```

---

## 🚨 РЕШЕНИЕ ТИПИЧНЫХ ПРОБЛЕМ

### Проблема: Ошибки базы данных

```bash
# Если сервер не может подключиться к БД, проверьте:

# 1. Статус MySQL
sudo systemctl status mysql

# 2. Существование пользователя
mysql -u root -p'root123' -e "SELECT User, Host FROM mysql.user WHERE User = 'autoschool_user';"

# 3. Права пользователя
mysql -u root -p'root123' -e "SHOW GRANTS FOR 'autoschool_user'@'localhost';"

# 4. Подключение пользователя
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db -e "SHOW TABLES;"
```

### Проблема: CORS ошибки

```bash
# Если в браузере видите ошибки CORS:

# 1. Проверьте настройки Nginx
sudo nginx -t
sudo systemctl reload nginx

# 2. Проверьте переменные окружения клиента
cat /var/www/autoschool/client/.env.local

# 3. Перезапустите клиент
pm2 restart autoschool-client
```

### Проблема: PM2 приложения не запускаются

```bash
# Проверьте логи PM2
pm2 logs --lines 50

# Перезапустите приложения по очереди
pm2 delete all
pm2 start ecosystem.config.js --only autoschool-server
# Дождитесь успешного запуска, затем:
pm2 start ecosystem.config.js --only autoschool-client
```

### Проблема: Статические файлы не загружаются

```bash
# Проверьте права на файлы
sudo chown -R ubuntu:ubuntu /var/www/autoschool

# Проверьте, что сборка прошла успешно
ls -la /var/www/autoschool/client/.next/
ls -la /var/www/autoschool/server/dist/

# Очистите кэш браузера или попробуйте в режиме инкогнито
```

### Проблема: Импорт базы данных не работает

```bash
# Проверьте кодировку файла дампа и повторите импорт:
file /tmp/autoshkola_backup.sql

# Импортируйте с указанием кодировки:
mysql -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db --default-character-set=utf8mb4 < /tmp/autoshkola_backup.sql
```

---

## ✅ ЧЕКЛИСТ УСПЕШНОГО ДЕПЛОЯ

- [ ] Сервер Ubuntu подготовлен и очищен
- [ ] Node.js, MySQL, Nginx установлены/переустановлены
- [ ] MySQL настроен с минимальной защитой
- [ ] База данных autoshkola_db создана
- [ ] Пользователь autoschool_user создан с правильным паролем
- [ ] Локальная база данных импортирована на сервер
- [ ] Локальные файлы проекта загружены на сервер
- [ ] .env файлы настроены с правильными параметрами
- [ ] Сервер собран (npm run build) без ошибок
- [ ] Клиент собран (npm run build) без ошибок
- [ ] Nginx настроен и запущен
- [ ] PM2 приложения запущены без ошибок базы данных
- [ ] Сайт открывается по IP http://82.115.43.207
- [ ] API отвечает на запросы без ошибок CORS
- [ ] Админ пользователь создан (если нужно)
- [ ] Все основные функции работают

---

## 🎉 ПОЗДРАВЛЯЕМ!

Ваш сайт AutoSchool успешно развернут на Ubuntu сервере с локальными файлами!

**Доступ к сайту:**

- Ваш сайт: `http://82.115.43.207`
- Админ-панель: `http://82.115.43.207/admin`
- API: `http://82.115.43.207/api`
- Мониторинг PM2: `pm2 monit`

**Полезные команды для управления:**

```bash
# Проверка статуса
pm2 status
sudo systemctl status nginx mysql

# Просмотр логов
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Перезапуск сервисов
pm2 restart all
sudo systemctl reload nginx

# Резервное копирование
mysqldump -u autoschool_user -p'AutoSchool!Database@2024#Strong' autoshkola_db > backup_$(date +%Y%m%d).sql
```

**Не забудьте:**

1. Сменить пароль администратора после входа
2. Настроить регулярные бэкапы базы данных
3. Мониторить логи и производительность
4. Обновлять проект через загрузку новых архивов

Удачи! 🚀
