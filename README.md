# Marketing Bureau

Маркетинговое бюро полного цикла — корпоративный сайт с CMS.

🌐 **Live:** _(после деплоя на Vercel — см. [DEPLOY.md](./DEPLOY.md))_

---

## ✨ Возможности

### Публичный сайт
- **Главная** — 7 секций: HERO, экспертиза, услуги, почему-мы, кейсы, FAQ, CTA
- **Кейсы** — каждый кейс как отдельная кликабельная страница (`/?case=slug`)
- **Услуги** — отдельная страница со списком
- **Блог** — статьи с детальными страницами
- **FAQ** — отдельная страница + блок на главной
- **О нас** — rich-text контент
- **Политика конфиденциальности** — редактируемая
- **SEO** — постраничные мета-данные, Open Graph, schema.org JSON-LD, sitemap, robots.txt
- **Telegram-уведомления** о новых заявках с CTA-формы

### Админка (`/?view=admin`)
- Cookie-based авторизация по телефону + паролю
- CRUD для услуг, кейсов, FAQ, экспертизы, преимуществ, статей
- **Управляемые соцсети** — добавляйте любые соцсети с готовой иконкой (Lucide) или загружайте своё изображение
- Загрузка изображений в БД (работает на Vercel serverless)
- Редактирование настроек сайта, SEO, контента секций
- Просмотр и удаление заявок
- Управление участниками админки
- Сброс пароля через Telegram-бота

### CTA-форма
- Поля: имя, телефон, email, комментарий
- Email обязателен
- Валидация казахстанских DEF-кодов (Beeline/izi, Kcell/Activ, Tele2/Altel)
- Без лейблов, только плейсхолдеры — чистый минималистичный дизайн

## 🛠 Технологии

- **Next.js 16** (App Router, Turbopack, standalone build)
- **React 19** + **TypeScript 5**
- **Prisma 6** (SQLite для локали, PostgreSQL для production)
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives)
- **Tiptap 3** (rich-text editor)
- **lucide-react** (иконки)
- **sonner** (toast-уведомления)
- **framer-motion** (анимации)

## 🚀 Быстрый старт (локально)

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать env-шаблон и заполнить
cp .env.example .env
# отредактировать .env: ADMIN_SECRET, DATABASE_URL (SQLite по умолчанию)

# 3. Сгенерировать Prisma-клиент и применить схему
npx prisma generate
npx prisma db push

# 4. Заполнить БД начальными данными
npm run db:seed

# 5. Запустить dev-сервер
npm run dev
```

Откройте http://localhost:3000

**Вход в админку:** http://localhost:3000/?view=admin
- Телефон: `+77758494020`
- Пароль: `admin` *(смените сразу после входа!)*

## ☁️ Деплой на Vercel

См. подробную инструкцию: **[DEPLOY.md](./DEPLOY.md)**

Кратко:
1. PostgreSQL на [Neon](https://neon.tech) (бесплатно)
2. Импорт репозитория в Vercel
3. Environment Variables: `DATABASE_URL` + `ADMIN_SECRET`
4. Deploy — миграции применятся автоматически через `npm run vercel-build`
5. Один раз запустите `npm run db:seed` с production `DATABASE_URL`

## 📂 Структура

```
prisma/
├── schema.prisma              # SQLite — локальная разработка
├── schema.prod.prisma         # PostgreSQL — Vercel / production
└── migrations/                # SQL-миграции (PostgreSQL)
src/
├── app/
│   ├── api/                   # API routes (serverless)
│   ├── uploads/[filename]/    # Раздача изображений из БД
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/                 # Админ-панель
│   ├── site/                  # Публичный сайт
│   └── ui/                    # shadcn/ui компоненты
└── lib/                       # Бизнес-логика, Prisma client, auth
scripts/
├── seed.ts                    # Идемпотентный сид
└── create-prod-migration.sh   # Помощник создания миграций
```

## 📝 Лицензия

Private — © Marketing Bureau
