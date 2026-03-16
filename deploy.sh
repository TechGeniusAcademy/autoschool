#!/bin/bash

# Скрипт деплоя AutoSchool на Ubuntu сервер
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем деплой AutoSchool..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    print_error "Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Останавливаем приложения
print_warning "Останавливаем приложения..."
pm2 stop autoschool-server autoschool-client || true

# Обновляем код из git (если используется)
if [ -d ".git" ]; then
    print_status "Обновляем код из Git..."
    git pull origin main
fi

# Устанавливаем зависимости сервера
print_status "Устанавливаем зависимости сервера..."
cd server
npm install --production=false

# Билдим сервер
print_status "Собираем сервер..."
npm run build

cd ..

# Устанавливаем зависимости клиента
print_status "Устанавливаем зависимости клиента..."
cd client
npm install

# Билдим клиент
print_status "Собираем клиент..."
npm run build

cd ..

# Запускаем приложения через PM2
print_status "Запускаем приложения..."
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

print_status "Деплой завершен успешно! 🎉"
print_status "Проверьте статус: pm2 status"
print_status "Просмотр логов: pm2 logs"