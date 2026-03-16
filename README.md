# 🚗 AutoSchool - Система управления автошколой

Современная веб-система для управления автошколой с админ-панелью, личными кабинетами и полным функционалом.

## 🏗️ Архитектура

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **База данных**: MySQL
- **Аутентификация**: JWT
- **Файлы**: Multer для загрузки изображений

## 📁 Структура проекта

```
AutoSchool/
├── client/          # Frontend (Next.js)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── constants/
│   ├── public/
│   └── package.json
├── server/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   └── package.json
├── ecosystem.config.js    # PM2 конфигурация
├── nginx.conf            # Nginx конфигурация
├── deploy.sh            # Скрипт деплоя
└── DEPLOY.md           # Подробная инструкция по деплою
```

## 🚀 Быстрый старт для разработки

### Предварительные требования

- Node.js 18+
- MySQL 8.0+
- npm или yarn

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd AutoSchool

# Установка зависимостей сервера
cd server
npm install
cp .env.example .env
# Настройте .env файл

# Установка зависимостей клиента
cd ../client
npm install
```

### 2. Настройка базы данных

```sql
CREATE DATABASE autoschool;
-- Таблицы создадутся автоматически при первом запуске сервера
```

### 3. Запуск для разработки

```bash
# В одном терминале - сервер
cd server
npm run dev

# В другом терминале - клиент
cd client
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5000

## 🎯 Основные функции

### 👨‍💼 Админ-панель

- ✅ Управление пользователями (студенты, инструкторы)
- ✅ Управление курсами и уроками
- ✅ Управление расписанием
- ✅ Управление группами
- ✅ Управление ценами и тарифами
- ✅ Управление отзывами
- ✅ Управление блогом
- ✅ Настройки профиля
- ✅ Отчеты и аналитика

### 👨‍🎓 Личный кабинет студента

- ✅ Просмотр курсов и уроков
- ✅ Отслеживание прогресса
- ✅ Просмотр расписания
- ✅ Информация о группе
- ✅ Профиль пользователя

### 👨‍🏫 Личный кабинет инструктора

- ✅ Управление студентами
- ✅ Просмотр расписания
- ✅ Отчеты по урокам
- ✅ Профиль инструктора

### 🌐 Публичная часть

- ✅ Главная страница
- ✅ Страница курсов
- ✅ Страница цен
- ✅ Страница отзывов
- ✅ Блог
- ✅ Контакты
- ✅ О нас

## 🛠️ Технологии

### Frontend

- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **React Icons** - Иконки
- **React Hook Form** - Формы
- **SWR** - Кэширование данных

### Backend

- **Node.js** - Runtime
- **Express.js** - Web фреймворк
- **TypeScript** - Типизация
- **MySQL2** - База данных
- **JWT** - Аутентификация
- **Bcrypt** - Хэширование паролей
- **Multer** - Загрузка файлов
- **Express Validator** - Валидация

## 📚 API Документация

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Профиль пользователя
- `PUT /api/auth/profile` - Обновление профиля
- `PUT /api/auth/change-password` - Смена пароля

### Админ API

- `GET /api/admin/users` - Список пользователей
- `POST /api/admin/courses` - Создание курса
- `GET /api/admin/courses` - Список курсов
- И множество других endpoints...

## 🚀 Деплой

Подробная инструкция по деплою находится в файле [DEPLOY.md](./DEPLOY.md)

### Быстрый деплой

```bash
# На сервере Ubuntu
./deploy.sh
```

## 🔧 Конфигурация

### Переменные окружения сервера (.env)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=autoschool
JWT_SECRET=your_secret
PORT=3001
```

### Переменные окружения клиента (.env.local)

```env
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
```

## 📈 Мониторинг и логи

```bash
# Статус приложений
pm2 status

# Просмотр логов
pm2 logs

# Мониторинг ресурсов
pm2 monit
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте feature ветку
3. Сделайте коммит изменений
4. Пушьте в ветку
5. Создайте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте [DEPLOY.md](./DEPLOY.md) для инструкций по деплою
2. Проверьте логи приложений
3. Создайте Issue в репозитории
