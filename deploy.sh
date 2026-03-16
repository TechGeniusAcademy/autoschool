#!/bin/bash

# =============================================================
#  AutoSchool — скрипт деплоя / обновления с GitHub
#  Использование:
#    Первый запуск (установка):  sudo bash deploy.sh --install
#    Обновление из git:          bash deploy.sh
#    Только рестарт PM2:         bash deploy.sh --restart
# =============================================================

set -e

# ───── Настройки ─────────────────────────────────────────────
APP_DIR="/var/www/autoschool"
REPO_URL="https://github.com/TechGeniusAcademy/autoschool.git"
BRANCH="main"
PM2_SERVER="autoschool-server"
PM2_CLIENT="autoschool-client"
LOG_FILE="/var/log/autoschool-deploy.log"
# ─────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅  $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}⚠️   $1${NC}" | tee -a "$LOG_FILE"; }
err()  { echo -e "${RED}❌  $1${NC}" | tee -a "$LOG_FILE"; }
info() { echo -e "${BLUE}ℹ️   $1${NC}" | tee -a "$LOG_FILE"; }

echo "" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo " 🚀  AutoSchool Deploy  $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"

# ───── Проверка зависимостей ──────────────────────────────────
check_deps() {
    for cmd in git node npm pm2; do
        if ! command -v "$cmd" &>/dev/null; then
            err "Не найдена утилита: $cmd"
            exit 1
        fi
    done
    ok "Все зависимости установлены (git, node, npm, pm2)"
}

# ───── Swap (защита от OOM) ───────────────────────────────────
ensure_swap() {
    if ! swapon --show | grep -q '/swapfile'; then
        warn "Swap не найден — создаём 2 GB swapfile..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
        ok "Swap создан и активирован"
    else
        ok "Swap уже активен"
    fi
}

# ───── Первичная установка ────────────────────────────────────
install_app() {
    info "Режим: первичная установка"
    ensure_swap
    check_deps

    mkdir -p /var/log/pm2
    mkdir -p "$APP_DIR"

    if [ -d "$APP_DIR/.git" ]; then
        warn "Директория уже содержит git-репозиторий — пропускаем clone"
    else
        ok "Клонируем репозиторий..."
        git clone "$REPO_URL" "$APP_DIR"
    fi

    update_app
}

# ───── Резервная копия .next ──────────────────────────────────
backup_build() {
    if [ -d "$APP_DIR/client/.next" ]; then
        cp -r "$APP_DIR/client/.next" "$APP_DIR/client/.next.bak" 2>/dev/null || true
    fi
}

rollback_build() {
    err "Сборка не удалась — откат к предыдущей версии"
    if [ -d "$APP_DIR/client/.next.bak" ]; then
        rm -rf "$APP_DIR/client/.next"
        mv "$APP_DIR/client/.next.bak" "$APP_DIR/client/.next"
        warn "Восстановлена предыдущая сборка клиента"
    fi
}

# ───── Обновление (основной флоу) ────────────────────────────
update_app() {
    check_deps

    # 1. Git pull
    cd "$APP_DIR"
    ok "Получаем обновления из Git (ветка: $BRANCH)..."
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse "origin/$BRANCH")

    if [ "$LOCAL" = "$REMOTE" ] && [ "$1" != "--force" ]; then
        ok "Код уже актуален (commit: ${LOCAL:0:7}). Обновление не требуется."
        ok "Используйте 'bash deploy.sh --force' для принудительного ребилда."
        restart_pm2
        exit 0
    fi

    git reset --hard "origin/$BRANCH"
    ok "Код обновлён → commit: $(git rev-parse --short HEAD)"

    # 2. Сборка сервера
    ok "Устанавливаем зависимости сервера..."
    cd "$APP_DIR/server"
    npm ci --omit=dev=false 2>&1 | tail -3

    ok "Собираем сервер (TypeScript → dist/)..."
    npm run build
    ok "Сервер собран: dist/index.js"

    # 3. Сборка клиента
    ok "Устанавливаем зависимости клиента..."
    cd "$APP_DIR/client"
    npm ci 2>&1 | tail -3

    backup_build
    ok "Собираем клиент (Next.js build)..."
    if ! npm run build; then
        rollback_build
        err "Деплой прерван из-за ошибки сборки клиента"
        exit 1
    fi
    rm -rf "$APP_DIR/client/.next.bak" 2>/dev/null || true
    ok "Клиент собран: .next/"

    # 4. PM2
    restart_pm2

    # 5. Nginx
    reload_nginx
}

# ───── Перезапуск PM2 ─────────────────────────────────────────
restart_pm2() {
    cd "$APP_DIR"
    info "Перезапускаем PM2 процессы..."

    if pm2 list | grep -q "$PM2_SERVER"; then
        pm2 reload "$PM2_SERVER" --update-env
    else
        pm2 start ecosystem.config.js --only "$PM2_SERVER"
    fi

    if pm2 list | grep -q "$PM2_CLIENT"; then
        pm2 reload "$PM2_CLIENT" --update-env
    else
        pm2 start ecosystem.config.js --only "$PM2_CLIENT"
    fi

    pm2 save
    ok "PM2 перезапущен"

    # Краткий статус
    sleep 2
    echo ""
    pm2 list
    echo ""
}

# ───── Перезагрузка nginx ─────────────────────────────────────
reload_nginx() {
    if command -v nginx &>/dev/null; then
        if nginx -t 2>/dev/null; then
            systemctl reload nginx && ok "Nginx перезагружен" || warn "Не удалось перезагрузить nginx (проверьте sudo права)"
        else
            warn "Ошибка конфигурации nginx — пропускаем reload"
        fi
    fi
}

# ───── Точка входа ────────────────────────────────────────────
case "${1:-}" in
    --install)
        install_app
        ;;
    --restart)
        restart_pm2
        reload_nginx
        ;;
    --force)
        update_app --force
        ;;
    "")
        update_app
        ;;
    *)
        echo "Использование: bash deploy.sh [--install | --restart | --force]"
        exit 1
        ;;
esac

echo ""
ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok " Деплой завершён успешно! 🎉"
ok " Лог: $LOG_FILE"
ok " Статус: pm2 status"
ok " Логи:   pm2 logs"
ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"