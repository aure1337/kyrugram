# Telegram Clone

Мессенджер в стиле Telegram с использованием Next.js, Supabase и Vercel.

## Фичи

- 🔐 Регистрация и авторизация
- 💬 Личные чаты в реальном времени
- 👤 Профили пользователей (username, описание, аватарка)
- 📱 Адаптивный дизайн
- ⚡ Realtime обновления

## Стек технологий

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Realtime, Auth, Storage)
- **Deployment**: Vercel

## Установка

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Создайте `.env.local` файл и добавьте переменные окружения
4. Запустите проект: `npm run dev`

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL скрипты из `supabase/schema.sql`
3. Скопируйте URL и anon key в `.env.local`

## Деплой на Vercel

1. Импортируйте проект на [vercel.com](https://vercel.com)
2. Добавьте переменные окружения
3. Деплойте!
