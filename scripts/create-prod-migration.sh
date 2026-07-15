#!/usr/bin/env bash
#
# Создание новой Prisma-миграции для production (PostgreSQL).
#
# Использование:
#   bash scripts/create-prod-migration.sh "название_миграции"
#
# Требует:
#   - DATABASE_URL (PostgreSQL) в .env или в окружении
#   - Доступ к PostgreSQL-базе (например, dev-branch на Neon)
#
# Что делает:
#   1. Запускает `prisma migrate dev --name <name>` против prod-схемы
#   2. Миграции сохраняются в prisma/migrations/ (синтаксис PostgreSQL)
#   3. На Vercel они применяются через `prisma migrate deploy --schema=prisma/schema.prod.prisma`
#
# ВАЖНО: используйте отдельную dev-базу PostgreSQL (например, Neon dev branch),
# НЕ production-базу — `migrate dev` может сбросить данные при рассинхронизации.

set -euo pipefail

NAME="${1:-update}"
echo "▸ Создаю миграцию: $NAME"
echo "▸ Schema: prisma/schema.prod.prisma (PostgreSQL)"
echo "▸ DATABASE_URL: ${DATABASE_URL:-(не задан!)}"
echo ""

if [ -z "${DATABASE_URL:-}" ]; then
  echo "✗ Ошибка: DATABASE_URL не задан."
  echo "  Установите его в .env или передайте через окружение:"
  echo "    DATABASE_URL='postgresql://...' bash scripts/create-prod-migration.sh 'name'"
  exit 1
fi

# Проверяем, что DATABASE_URL — это postgresql
if [[ ! "$DATABASE_URL" =~ ^postgres ]]; then
  echo "✗ Ошибка: DATABASE_URL должен начинаться с 'postgres' для production-миграций."
  echo "  Текущее значение: $DATABASE_URL"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "▸ Запуск prisma migrate dev..."
npx prisma migrate dev \
  --schema=prisma/schema.prod.prisma \
  --name="$NAME"

echo ""
echo "✓ Миграция создана."
echo "  Не забудьте закоммитить папку prisma/migrations/:"
echo "    git add prisma/migrations prisma/schema.prod.prisma"
echo "    git commit -m 'Add migration: $NAME'"
echo "    git push"
