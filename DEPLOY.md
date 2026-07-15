# Деплой на Vercel

Пошаговая инструкция по развёртыванию **Marketing Bureau** на Vercel с автоматическим применением миграций при каждом пуше.

---

## 📋 Что нужно

1. **Аккаунт Vercel** — https://vercel.com/signup (вход через GitHub)
2. **GitHub-репозиторий** — куда вы загрузите код проекта
3. **PostgreSQL-база** — любая managed:
   - **Neon** (рекомендуется, бесплатно для старта) — https://neon.tech
   - Supabase — https://supabase.com
   - Vercel Postgres — https://vercel.com/docs/storage/vercel-postgres

> ⚠️ **Важно:** SQLite (используется по умолчанию в sandbox) **не подходит для Vercel**, потому что serverless-функции имеют эфемерную файловую систему — данные будут теряться после каждого cold start. На production используем PostgreSQL.

---

## 📂 Структура БД-конфигурации

```
prisma/
├── schema.prisma              # SQLite — для локальной разработки
├── schema.prod.prisma         # PostgreSQL — для Vercel / production
└── migrations/
    ├── migration_lock.toml    # provider = "postgresql"
    └── 20260715000000_init/
        └── migration.sql      # Начальная SQL-миграция (PostgreSQL)
```

- **Локально** (`npm run dev`): используется `schema.prisma` + SQLite, синхронизация через `prisma db push` (без миграций).
- **На Vercel** (`npm run vercel-build`): автоматически вызывается `prisma generate --schema=prisma/schema.prod.prisma` + `prisma migrate deploy --schema=prisma/schema.prod.prisma` + `next build`.

---

## 🚀 Шаг 1. Подготовка PostgreSQL

### Вариант A: Neon (рекомендуется)

1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект: **New Project** → имя `marketing-bureau`
3. После создания скопируйте **connection string** — выглядит так:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/marketing_bureau?sslmode=require
   ```

### Вариант B: Vercel Postgres

1. В Vercel откройте проект → вкладка **Storage** → **Create Database** → **Postgres**
2. После создания Vercel автоматически добавит `DATABASE_URL` и другие переменные в окружение

---

## 🚀 Шаг 2. Загрузка кода в GitHub

1. Создайте новый репозиторий на GitHub (например, `marketing-bureau`)
2. Инициализируйте git и запушьте код:

```bash
cd /path/to/extracted
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/marketing-bureau.git
git push -u origin main
```

> Файлы `.env`, `db/`, `upload/`, `node_modules/`, `.next/` уже в `.gitignore` — они не попадут в репозиторий.
> Файлы `.env.example`, `prisma/schema.prod.prisma`, `prisma/migrations/` — попадут (как и должно быть).

---

## 🚀 Шаг 3. Импорт проекта в Vercel

1. Откройте https://vercel.com/new
2. Выберите ваш GitHub-репозиторий `marketing-bureau`
3. Vercel автоматически определит Next.js — настройки **Framework Preset** должны быть `Next.js`
4. **НЕ нажимайте Deploy сразу** — сначала настройте Environment Variables (следующий шаг)

---

## 🚀 Шаг 4. Настройка Environment Variables

В Vercel откройте проект → вкладка **Settings** → **Environment Variables** и добавьте:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` (ваша строка из Neon/Supabase/Vercel) | Production, Preview, Development |
| `ADMIN_SECRET` | длинная случайная строка (см. ниже) | Production, Preview, Development |

> `DATABASE_PROVIDER` добавлять НЕ нужно — на Vercel всегда используется `schema.prod.prisma` (PostgreSQL).

### Генерация ADMIN_SECRET

```bash
openssl rand -hex 32
```

Используйте вывод как значение `ADMIN_SECRET`.

> 🔐 **Не используйте** значение из `.env.example` на production — это публичный demo-секрет.

---

## 🚀 Шаг 5. Деплой

1. В Vercel нажмите **Deploy**
2. Vercel выполнит `npm install` → `npm run vercel-build`:
   - `prisma generate --schema=prisma/schema.prod.prisma` — генерация клиента для PostgreSQL
   - `prisma migrate deploy --schema=prisma/schema.prod.prisma` — применение миграций к вашей PostgreSQL
   - `next build` — сборка Next.js
3. Дождитесь завершения (3–5 минут)

Если всё прошло успешно — Vercel даст URL вида `marketing-bureau-xxx.vercel.app`.

---

## 🚀 Шаг 6. Первый сид БД (заполнение начальными данными)

После первого деплоя нужно один раз заполнить БД начальными данными (настройки сайта, услуги, кейсы, FAQ и т.д.).

### Способ A: локально с production DATABASE_URL

```bash
# 1. Временно подменяем .env на production
cp .env .env.local-backup
cat > .env <<EOF
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://...ваша-строка-из-Neon..."
ADMIN_SECRET="your-production-secret"
EOF

# 2. Генерируем PostgreSQL-клиент
npm run db:generate:prod

# 3. Запускаем сид
npm run db:seed

# 4. Возвращаем локальный .env
mv .env.local-backup .env
```

### Способ B: через Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link  # в папке проекта

# Скачиваем production env
vercel env pull .env.vercel --environment=production

# Временно подменяем
cp .env .env.local-backup
cp .env.vercel .env

npm run db:generate:prod
npm run db:seed

mv .env.local-backup .env
```

После сида в админке можно войти:
- URL: `https://ваш-домен.vercel.app/?view=admin`
- Телефон: `+77758494020`
- Пароль: `admin` (смените сразу после входа!)

---

## 🚀 Шаг 7. Привязка своего домена (опционально)

1. Vercel → Project → **Settings** → **Domains**
2. Добавьте свой домен (например, `marketingbureau.kz`)
3. Vercel даст DNS-записи — добавьте их у вашего регистратора
4. После проверки SSL — сайт доступен по вашему домену
5. В админке → «Настройки сайта» → `siteUrl` — впишите ваш домен (нужно для корректных canonical URLs, sitemap, OG-метаданных)

---

## 🔧 Автоматическое развёртывание

После первоначальной настройки **каждый `git push origin main`** автоматически:
1. Запускает в Vercel новый деплой
2. Применяет новые миграции (`prisma migrate deploy --schema=prisma/schema.prod.prisma`)
3. Публикует новую версию

**Preview-деплои** автоматически создаются для pull request'ов — удобно тестировать изменения до мёрджа.

---

## 🔄 Изменение моделей Prisma

Если вы изменили модели в `prisma/schema.prisma` (например, добавили поле):

### 1. Обновите ОБА файла схемы
- `prisma/schema.prisma` (SQLite)
- `prisma/schema.prod.prisma` (PostgreSQL)
- Модели должны быть идентичны — отличается только `provider` в `datasource`

### 2. Локально примените через `db push`
```bash
npm run db:push
```

### 3. Создайте production-миграцию
Нужна временная PostgreSQL-база (dev-branch на Neon — идеально).

```bash
# В .env временно прописываем DEV postgres URL
DATABASE_URL="postgresql://...dev-branch..." \
  bash scripts/create-prod-migration.sh "add_new_field"
```

Это создаст папку `prisma/migrations/<timestamp>_add_new_field/migration.sql`.

### 4. Закоммитьте и запушьте
```bash
git add prisma/schema.prisma prisma/schema.prod.prisma prisma/migrations
git commit -m "Add new field to Model"
git push
```

Vercel автоматически применит новую миграцию при следующем деплое.

---

## 🆘 Частые проблемы

### `Error: P1001: Can't reach database server`
- Проверьте, что `DATABASE_URL` в Vercel корректный
- На Neon: проверьте, что connection string из правильного environment (не из branches)
- Проверьте, что IP Vercel не в blocklist'е у вашего DB-провайдера

### `Error: P1003: Database does not exist`
- На Neon создайте БД в дашборде (обычно уже создана с проектом)
- На Vercel Postgres БД создаётся автоматически

### `Error: P1010: User was denied access`
- Проверьте логин/пароль в `DATABASE_URL`
- На Neon: убедитесь, что используете connection string с правами на запись

### После деплоя сайт показывает «Кейс не найден» / пустые секции
- Вы забыли запустить сид (Шаг 6) — БД пустая

### `prisma migrate deploy` падает с `unique constraint`
- БД не пустая (возможно, вы запускали сид до миграций)
- Решение: удалите все таблицы в БД (на Neon через SQL Editor: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`), затем в Vercel — Redeploy

### Не приходит Telegram-уведомление о заявке
- В админке (раздел **Настройки сайта**) проверьте `telegramBotToken` и `telegramLeadsChatId`
- Эти значения хранятся в БД, не в env (чтобы можно было менять без редеплоя)

### Забыли пароль админа
- Зайдите в админку → «Забыли пароль?» (форма отправки на телефон)
- Или через prisma studio:
  ```bash
  DATABASE_URL="postgresql://..." npx prisma studio --schema=prisma/schema.prod.prisma
  # Найдите SiteSettings → adminPasswordHash → впишите хэш пароля "admin":
  # 3fd4bbc71815f28b47c71c53df2efdad3168e8149ac40f09ef4a6979915b46c5
  ```

---

## 📂 Структура проекта (ключевое)

```
.
├── prisma/
│   ├── schema.prisma              # SQLite (локальная разработка)
│   ├── schema.prod.prisma         # PostgreSQL (Vercel / production)
│   └── migrations/                # SQL-миграции (PostgreSQL-синтаксис)
│       ├── migration_lock.toml
│       └── 20260715000000_init/migration.sql
├── scripts/
│   ├── seed.ts                    # Идемпотентный сид (tsx)
│   └── create-prod-migration.sh   # Помощник создания миграций
├── src/
│   ├── app/
│   │   ├── api/                   # API routes (serverless functions на Vercel)
│   │   ├── uploads/[filename]/    # Раздача изображений из БД
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/                 # Админ-панель (вход: /?view=admin)
│   │   ├── site/                  # Публичный сайт
│   │   └── ui/                    # shadcn/ui компоненты
│   └── lib/
│       ├── auth.ts                # Cookie-based admin auth
│       ├── db.ts                  # Prisma client singleton
│       └── ...
├── .env.example                   # Шаблон env-переменных (коммитится)
├── .gitignore                     # .env, db/, upload/, .next/ — исключены
├── DEPLOY.md                      # Этот файл
├── next.config.ts                 # output: "standalone" (для Vercel)
├── package.json                   # Скрипты: dev / build / vercel-build / db:seed
├── tsconfig.json
└── vercel.json                    # Настройки Vercel (framework, build-cmd)
```

---

## ✅ Чек-лист перед деплоем

- [ ] Код запушен в GitHub
- [ ] В Vercel добавлены env: `DATABASE_URL` (PostgreSQL), `ADMIN_SECRET`
- [ ] `ADMIN_SECRET` — длинная случайная строка (не demo-значение!)
- [ ] `prisma/migrations/` закоммичены
- [ ] После первого деплоя запущен сид (`npm run db:seed` с production DATABASE_URL)
- [ ] Сразу после сида сменён пароль админа (с `admin` на свой)
- [ ] Привязан домен (если нужен)
- [ ] В админке → «Настройки сайта» → `siteUrl` — впишите production-домен
- [ ] Тест: отправка заявки через CTA-форму → приходит в Telegram
- [ ] Тест: логин в админку по `/?view=admin`
