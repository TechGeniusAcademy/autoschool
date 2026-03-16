# 📋 Инструкция по деплою AutoSchool на Ubuntu через SSH

## 🎯 Предварительные требования

### На локальной машине:

- Git
- SSH ключи настроены для подключения к серверу

### На сервере Ubuntu:

- Ubuntu 20.04+
- Sudo доступ
- Домен или IP адрес

## 🚀 Пошаговая инструкция деплоя

### 1. Подготовка сервера

#### Подключение к серверу

```bash
ssh your-username@your-server-ip
```

#### Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

#### Установка Node.js (версия 18+)

```bash
# Установка Node.js через NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

#### Установка дополнительных пакетов

```bash
sudo apt install -y git nginx mysql-server
```

#### Установка PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 2. Настройка MySQL

#### Безопасная установка MySQL

```bash
sudo mysql_secure_installation
```

#### Создание базы данных и пользователя

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE autoschool;
CREATE USER 'autoschool_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON autoschool.* TO 'autoschool_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Подготовка директорий

#### Создание директории для проекта

```bash
sudo mkdir -p /var/www/autoschool
sudo chown -R $USER:$USER /var/www/autoschool
cd /var/www/autoschool
```

### 4. Загрузка кода на сервер

#### Вариант 1: Через Git (рекомендуется)

```bash
# Клонирование репозитория
git clone https://your-git-repo-url.git .

# Если репозитория нет, создайте его на GitHub/GitLab
```

#### Вариант 2: Загрузка через SCP

```bash
# На локальной машине
scp -r /path/to/AutoSchool your-username@your-server-ip:/var/www/autoschool/
```

### 5. Настройка переменных окружения

#### Создание .env файла для сервера

```bash
cd /var/www/autoschool/server
cp .env.example .env
nano .env
```

#### Настройка .env файла:

```env
# База данных
DB_HOST=localhost
DB_USER=autoschool_user
DB_PASSWORD=strong_password_here
DB_NAME=autoschool

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Сервер
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=http://your-domain.com

# Файлы
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5242880
```

### 6. Обновление API URLs в клиенте

#### Изменить API URLs в клиенте

```bash
cd /var/www/autoschool/client/src/constants
nano api.ts
```

Изменить на:

```typescript
export const SERVER_URL = "http://your-domain.com";
export const API_BASE_URL = "http://your-domain.com/api";
```

### 7. Установка зависимостей и сборка

#### Сервер

```bash
cd /var/www/autoschool/server
npm install
npm run build
```

#### Клиент

```bash
cd /var/www/autoschool/client
npm install
npm run build
```

### 8. Настройка Nginx

#### Копирование конфигурации

```bash
sudo cp /var/www/autoschool/nginx.conf /etc/nginx/sites-available/autoschool
```

#### Редактирование конфигурации

```bash
sudo nano /etc/nginx/sites-available/autoschool
```

Замените `your-domain.com` на ваш домен или IP.

#### Активация сайта

```bash
sudo ln -s /etc/nginx/sites-available/autoschool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Настройка PM2

#### Копирование конфигурации PM2

```bash
cd /var/www/autoschool
pm2 start ecosystem.config.js
```

#### Настройка автозапуска

```bash
pm2 startup
pm2 save
```

### 10. Настройка Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 11. Создание директорий для логов

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 12. Проверка работоспособности

#### Проверка статуса приложений

```bash
pm2 status
```

#### Просмотр логов

```bash
pm2 logs
```

#### Проверка Nginx

```bash
sudo systemctl status nginx
```

#### Проверка MySQL

```bash
sudo systemctl status mysql
```

## 🔄 Обновление приложения

### Автоматическое обновление

```bash
cd /var/www/autoschool
chmod +x deploy.sh
./deploy.sh
```

### Ручное обновление

```bash
# Остановить приложения
pm2 stop all

# Обновить код (если используется Git)
git pull origin main

# Пересобрать сервер
cd server
npm install
npm run build

# Пересобрать клиент
cd ../client
npm install
npm run build

# Запустить приложения
cd ..
pm2 start ecosystem.config.js
```

## 🔒 Настройка SSL (Let's Encrypt)

### Установка Certbot

```bash
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Получение SSL сертификата

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Настройка автообновления сертификата

```bash
sudo crontab -e
```

Добавить строку:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Диагностика проблем

### Проверка логов приложений

```bash
pm2 logs autoschool-server
pm2 logs autoschool-client
```

### Проверка логов Nginx

```bash
sudo tail -f /var/log/nginx/autoschool_error.log
sudo tail -f /var/log/nginx/autoschool_access.log
```

### Проверка процессов

```bash
ps aux | grep node
netstat -tulpn | grep :3001
netstat -tulpn | grep :5000
```

### Перезапуск сервисов

```bash
# Перезапуск приложений
pm2 restart all

# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск MySQL
sudo systemctl restart mysql
```

## 📊 Мониторинг

### PM2 мониторинг

```bash
pm2 monit
```

### Системные ресурсы

```bash
htop
df -h
free -h
```

## 🔧 Полезные команды

### PM2

```bash
pm2 status              # Статус всех процессов
pm2 logs               # Все логи
pm2 logs app-name      # Логи конкретного приложения
pm2 restart app-name   # Перезапуск приложения
pm2 stop app-name      # Остановка приложения
pm2 delete app-name    # Удаление приложения
pm2 save              # Сохранение текущей конфигурации
pm2 resurrect         # Восстановление сохраненных процессов
```

### Nginx

```bash
sudo nginx -t                    # Проверка конфигурации
sudo systemctl reload nginx     # Перезагрузка конфигурации
sudo systemctl restart nginx    # Перезапуск
sudo systemctl status nginx     # Статус
```

### MySQL

```bash
sudo mysql -u root -p                    # Подключение к MySQL
sudo systemctl status mysql              # Статус службы
sudo systemctl restart mysql             # Перезапуск
mysqldump -u user -p database > backup.sql # Бэкап
```

## 📝 Чеклист деплоя

- [ ] Сервер обновлен и подготовлен
- [ ] Node.js, MySQL, Nginx установлены
- [ ] База данных создана
- [ ] Код загружен на сервер
- [ ] .env файлы настроены
- [ ] API URLs обновлены в клиенте
- [ ] Приложения собраны (build)
- [ ] Nginx настроен
- [ ] PM2 настроен и приложения запущены
- [ ] Firewall настроен
- [ ] SSL сертификат установлен (опционально)
- [ ] Домен указывает на сервер
- [ ] Приложение доступно по URL
- [ ] Все функции работают корректно

## ⚠️ Важные замечания

1. **Безопасность**: Используйте сильные пароли для MySQL и JWT секрета
2. **Бэкапы**: Регулярно делайте бэкапы базы данных
3. **Обновления**: Регулярно обновляйте систему и зависимости
4. **Мониторинг**: Настройте мониторинг для отслеживания работы приложения
5. **Логи**: Регулярно очищайте логи от старых записей

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи приложений и сервисов
2. Убедитесь в правильности настроек
3. Проверьте статус всех сервисов
4. При необходимости перезапустите сервисы
