# 🔒 Рекомендации по безопасности для AutoSchool

## 🎯 Критически важные настройки

### 1. Переменные окружения

- ✅ JWT_SECRET должен быть длинным и случайным (минимум 32 символа)
- ✅ Пароли БД должны быть сложными
- ✅ Никогда не коммитьте .env файлы в Git

### 2. База данных

```bash
# Создайте отдельного пользователя БД для приложения
CREATE USER 'autoschool_app'@'localhost' IDENTIFIED BY 'strong_random_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON autoschool.* TO 'autoschool_app'@'localhost';

# Отключите root доступ извне
# В /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
```

### 3. Nginx безопасность

```nginx
# Скрыть версию Nginx
server_tokens off;

# Безопасные заголовки
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

# Ограничение размера тела запроса
client_max_body_size 10M;
client_body_timeout 10s;
client_header_timeout 10s;

# Защита от DDoS
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/m;

location /api/auth/login {
    limit_req zone=login burst=3 nodelay;
    # остальные настройки...
}

location /api {
    limit_req zone=api burst=10 nodelay;
    # остальные настройки...
}
```

### 4. PM2 безопасность

```bash
# Запуск от непривилегированного пользователя
sudo useradd -r -s /bin/false autoschool
sudo chown -R autoschool:autoschool /var/www/autoschool

# В ecosystem.config.js добавить:
user: 'autoschool',
```

### 5. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Дополнительная защита SSH
sudo ufw limit ssh
```

### 6. SSL/TLS

```bash
# Принудительное HTTPS
# В nginx.conf раскомментировать:
return 301 https://$server_name$request_uri;

# Сильные SSL настройки
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
```

## 🛡️ Безопасность приложения

### 1. Аутентификация

- ✅ JWT токены с коротким временем жизни
- ✅ Refresh токены для обновления
- ✅ Хэширование паролей с bcrypt
- ✅ Проверка силы паролей

### 2. Авторизация

- ✅ Middleware для проверки ролей
- ✅ Защита admin-only маршрутов
- ✅ Проверка прав на каждом endpoint

### 3. Валидация данных

- ✅ Express-validator для входных данных
- ✅ Санитизация HTML
- ✅ Проверка типов файлов при загрузке

### 4. Защита от атак

```javascript
// CORS настройки
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
});
app.use("/api/", limiter);

// Защита от XSS
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```

## 🔍 Мониторинг безопасности

### 1. Логирование

```javascript
// Winston logger
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "error.log", level: "error" }), new winston.transports.File({ filename: "combined.log" })],
});

// Логирование попыток входа
app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;
  const ip = req.ip;

  logger.info("Login attempt", { email, ip, timestamp: new Date() });
  // ... rest of login logic
});
```

### 2. Мониторинг файлов

```bash
# Установка fail2ban для защиты от bruteforce
sudo apt install fail2ban

# Конфигурация в /etc/fail2ban/jail.local
[nginx-login]
enabled = true
port = http,https
filter = nginx-login
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600
```

### 3. Обновления безопасности

```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Проверка обновлений NPM
npm audit
npm audit fix

# Обновление зависимостей
npm update
```

## 🚨 Checklist безопасности

### Перед деплоем:

- [ ] Сгенерирован сильный JWT_SECRET
- [ ] Установлены сложные пароли для БД
- [ ] Настроен HTTPS с действительным сертификатом
- [ ] Настроен firewall (UFW)
- [ ] Отключен root SSH доступ
- [ ] Настроен fail2ban
- [ ] Проверены права доступа к файлам
- [ ] Настроены безопасные заголовки Nginx
- [ ] Включено логирование

### После деплоя:

- [ ] Проверка SSL Rating (ssllabs.com)
- [ ] Сканирование портов (nmap)
- [ ] Проверка заголовков безопасности
- [ ] Тестирование rate limiting
- [ ] Проверка логов на ошибки
- [ ] Настройка мониторинга

## 🆘 В случае инцидента

### 1. Немедленные действия

```bash
# Заблокировать подозрительный IP
sudo ufw insert 1 deny from SUSPICIOUS_IP

# Проверить активные сессии
sudo who
sudo netstat -tulpn

# Проверить логи
sudo tail -f /var/log/auth.log
sudo tail -f /var/log/nginx/access.log
```

### 2. Восстановление

```bash
# Сменить все пароли
# Перегенерировать JWT_SECRET
# Очистить все активные сессии
# Проверить целостность файлов
```

### 3. Анализ

- Проанализировать логи атаки
- Выявить уязвимости
- Усилить защиту
- Уведомить пользователей при необходимости

## 📞 Контакты службы безопасности

В случае обнаружения уязвимостей:

- Email: security@your-domain.com
- Telegram: @security_contact
