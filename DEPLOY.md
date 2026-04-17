# Инструкция по деплою Telegram Clone

## 1. Настройка Supabase

1. Зайди на [supabase.com](https://supabase.com) и создай новый проект
2. Перейди в SQL Editor
3. Скопируй весь код из файла `supabase/schema.sql` и выполни его
4. Перейди в Settings → API
5. Скопируй:
   - Project URL
   - anon/public key

## 2. Настройка GitHub

1. Создай новый репозиторий на GitHub
2. В папке `telegram-clone` выполни команды:
```bash
git init
git add .
git commit -m "Initial commit: Telegram Clone"
git branch -M main
git remote add origin https://github.com/твой-username/telegram-clone.git
git push -u origin main
```

## 3. Деплой на Vercel

1. Зайди на [vercel.com](https://vercel.com)
2. Нажми "Add New Project"
3. Импортируй свой GitHub репозиторий
4. В разделе "Environment Variables" добавь:
   - `NEXT_PUBLIC_SUPABASE_URL` = твой Project URL из Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = твой anon key из Supabase
5. Нажми "Deploy"

## 4. После деплоя

1. Vercel даст тебе URL типа `https://твой-проект.vercel.app`
2. Зайди на этот URL
3. Зарегистрируйся и начни пользоваться!

## Локальная разработка (опционально)

Если хочешь запустить локально:

1. Установи Node.js (если еще не установлен)
2. В папке проекта создай файл `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=твой_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_ключ
```
3. Выполни команды:
```bash
npm install
npm run dev
```
4. Открой http://localhost:3000

## Возможные проблемы

### Ошибка при регистрации
- Проверь, что SQL скрипт выполнился полностью в Supabase
- Проверь, что в Supabase включена Email авторизация (Authentication → Providers → Email)

### Не работает realtime
- В Supabase перейди в Database → Replication
- Включи Realtime для таблиц: messages, chats, chat_participants

### Ошибки при деплое на Vercel
- Проверь, что все environment variables добавлены правильно
- Проверь логи деплоя в Vercel

## Что дальше?

Можешь добавить:
- Групповые чаты
- Отправку файлов и изображений
- Голосовые сообщения
- Статус "онлайн/оффлайн"
- Уведомления
- Темную/светлую тему
