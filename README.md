# AnimeSite — Аниме-сайт

Next.js + Node.js + PostgreSQL + YummyAnime API

## Структура проекта

```
├── frontend/          # Next.js (React + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── app/       # Страницы (App Router)
│   │   │   ├── page.tsx              # Главная (фид)
│   │   │   ├── catalog/page.tsx      # Каталог с фильтрами
│   │   │   ├── anime/[id]/page.tsx   # Страница тайтла
│   │   │   ├── watch/[id]/page.tsx   # Просмотр с плеером
│   │   │   ├── profile/page.tsx      # Личный кабинет
│   │   │   └── auth/page.tsx         # Авторизация
│   │   ├── components/  # UI-компоненты
│   │   ├── lib/         # API-клиент YummyAnime
│   │   └── store/       # Zustand (состояние)
│   └── ...
├── backend/           # Go + Chi + pgx
│   ├── main.go        # Точка входа, маршрутизация
│   └── internal/
│       ├── config/    # Конфигурация (.env)
│       ├── database/  # PostgreSQL (pgx pool)
│       ├── handlers/  # Обработчики (auth, user, anime)
│       ├── middleware/ # CORS, JWT-авторизация
│       └── models/    # Модели данных
└── docker-compose.yml # PostgreSQL + Redis
```

## Быстрый старт

### 1. Получить токен YummyAnime API

1. Зарегистрируйся на [yummyani.me](https://yummyani.me)
2. Перейди на [yummyani.me/dev/applications](https://yummyani.me/dev/applications)
3. Создай новое приложение и скопируй публичный токен

### 2. Фронтенд

```bash
cd frontend
npm install
```

Пропиши токен в `frontend/.env.local`:
```
NEXT_PUBLIC_YUMMY_APP_TOKEN=твой_токен
```

Запусти:
```bash
npm run dev        # http://localhost:3000
```

### 3. Бэкенд + БД (для авторизации и списков)

```bash
docker compose up -d postgres redis

cd backend
go run .           # http://localhost:5000
```

## Что реализовано

### Каталог и данные (YummyAnime API)
- Главная страница — фид с секциями (топ сезона, новинки, рекомендации, расписание, анонсы)
- Каталог с фильтрами (тип, статус, сезон, сортировка) и пагинацией
- Страница тайтла (постер, рейтинги, описание, жанры, студии, скриншоты)
- Поиск по названию (с debounce, мин. 3 символа)
- Расписание онгоингов

### Плеер
- Iframe-плеер с выбором озвучки и серии
- Группировка эпизодов по озвучке
- Навигация между эпизодами

### Бэкенд
- Go + Chi роутер
- PostgreSQL + pgx (Users, Watchlist, Progress, Comments, Ratings)
- JWT-авторизация (golang-jwt)
- bcrypt хеширование паролей
- Прокси к YummyAnime API

### Пользовательские фичи
- Авторизация (форма входа/регистрации)
- Профиль со списками (смотрю / просмотрено / планирую / брошено / избранное)
- Zustand с persist — списки сохраняются в localStorage

## Технологии

| Слой | Технология |
|------|-----------|
| Фронтенд | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Состояние | Zustand 5 |
| Бэкенд | Go, Chi, pgx |
| БД | PostgreSQL 16, Redis 7 |
| API | YummyAnime API v1 |
| Инфраструктура | Docker, Docker Compose |
