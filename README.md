# HanaAnime

> Платформа для просмотра аниме онлайн с русской озвучкой. Каталог, поиск, списки просмотра и избранное — всё в одном месте.

**HanaAnime** — веб-приложение для любителей аниме. Проект объединяет каталог и видео с YummyAnime API, собственную систему авторизации и персонализированные списки просмотра. Пастельный Shoujo-дизайн создаёт уютную атмосферу для погружения в мир аниме.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API](#api)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Для пользователя

- **Каталог аниме** — фильтрация по типу, статусу, сезону, сортировка по рейтингу и году
- **Поиск** — живой поиск с debounce, переход в каталог по запросу
- **Просмотр** — встроенный плеер, выбор озвучки, список эпизодов
- **Списки просмотра** — смотрю / просмотрено / планирую / брошено
- **Избранное** — отметка любимых тайтлов с синхронизацией
- **Расписание** — анонсы новых эпизодов

### Для разработчика

- **SSR** — главная страница, каталог и страницы аниме на сервере
- **JWT auth** — токены с 7-дневным сроком действия
- **Zustand + persist** — состояние в localStorage
- **Авто-миграции** — PostgreSQL schema при старте backend

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 15)                    │
│  Port: 3000  │  React 19, Tailwind 4, Zustand                   │
└────────┬────────────────────────────────────────────┬───────────┘
         │                                             │
         │ Прямые запросы                              │ REST API
         │ (каталог, поиск, видео)                     │ (auth, watchlist)
         ▼                                             ▼
┌────────────────────┐                    ┌─────────────────────────┐
│  YummyAnime API    │                    │   BACKEND (Go 1.26)    │
│  api.yani.tv       │                    │   Port: 5000            │
└────────────────────┘                    │   Chi router, JWT      │
                                           └───────────┬───────────┘
                                                       │
                                                       ▼
                                           ┌─────────────────────────┐
                                           │   PostgreSQL 16         │
                                           │   Port: 5433            │
                                           │   Users, Watchlist      │
                                           └─────────────────────────┘
```

### Потоки данных

| Действие          | Источник      | Маршрут                |
|-------------------|---------------|------------------------|
| Каталог, поиск    | YummyAnime API| Frontend → api.yani.tv |
| Эпизоды, видео    | YummyAnime API| Frontend → api.yani.tv |
| Регистрация/логин | Backend       | Frontend → Backend     |
| Списки, избранное | Backend       | Frontend → Backend → DB|

---

## Project Structure

```
Anime Project/
├── frontend/                 # Next.js приложение
│   ├── src/
│   │   ├── app/              # App Router страницы
│   │   │   ├── page.tsx       # Главная (feed, hero)
│   │   │   ├── catalog/      # Каталог с фильтрами
│   │   │   ├── anime/[id]/   # Страница тайтла
│   │   │   ├── watch/[id]/   # Плеер
│   │   │   ├── auth/         # Логин / регистрация
│   │   │   └── profile/      # Профиль, списки
│   │   ├── components/       # UI компоненты
│   │   ├── lib/              # API клиенты (auth, yummyanime, watchlist)
│   │   └── store/            # Zustand store
│   ├── next.config.ts
│   └── package.json
│
├── backend/                  # Go API сервер
│   ├── internal/
│   │   ├── config/           # Конфигурация из .env
│   │   ├── database/         # pgx pool, миграции
│   │   ├── handlers/         # auth, user, anime (proxy)
│   │   ├── middleware/       # CORS, JWT Auth
│   │   └── models/           # Request/Response модели
│   ├── main.go
│   ├── Dockerfile
│   └── go.mod
│
├── docker-compose.yml       # Postgres + Backend (+ Redis зарезервирован)
└── README.md
```

---

## Requirements

### Обязательные

| Компонент   | Версия     |
|------------|------------|
| Node.js    | >= 18      |
| Go         | >= 1.21    |
| PostgreSQL | >= 14      |
| npm        | >= 9       |

### Опциональные

- Docker & Docker Compose — для контейнеризации
- Redis — добавлен в `docker-compose`, пока не используется

---

## Installation

### 1. Клонирование

```bash
git clone https://github.com/your-username/anime-project.git
cd anime-project
```

### 2. Backend

```bash
cd backend
go mod download
go build -o server .
```

### 3. Frontend

```bash
cd frontend
npm install
```

### 4. База данных (локально)

Вариант A — через Docker:

```bash
docker run -d --name postgres-anime \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=anime_db \
  -p 5433:5432 \
  postgres:16-alpine
```

Вариант B — через `docker-compose` (Postgres + Backend):

```bash
docker-compose up -d postgres
# затем запустить backend локально или через docker-compose
```

---

## Configuration

### Backend (`.env` в корне `backend/`)

| Переменная      | Описание                      | По умолчанию                         |
|-----------------|-------------------------------|--------------------------------------|
| `PORT`          | Порт API сервера              | `5000`                               |
| `JWT_SECRET`    | Секрет для подписи JWT        | `fallback-secret` (⚠️ смени в prod!) |
| `YUMMY_APP_TOKEN` | Токен YummyAnime API        | — (обязательно)                      |
| `DATABASE_URL`  | Полный DSN PostgreSQL         | — (перекрывает отдельные DB_*)       |
| `DB_HOST`       | Хост БД                       | `127.0.0.1`                          |
| `DB_PORT`       | Порт БД                       | `5433`                               |
| `DB_USER`       | Пользователь БД               | `postgres`                           |
| `DB_PASSWORD`   | Пароль БД                     | `postgres`                           |
| `DB_NAME`       | Имя базы                      | `anime_db`                           |
| `CORS_ORIGINS`  | Разрешённые origins через запятую | `http://localhost:3000`          |

### Frontend (`.env.local` в `frontend/`)

| Переменная                  | Описание                | По умолчанию              |
|----------------------------|-------------------------|---------------------------|
| `NEXT_PUBLIC_YUMMY_APP_TOKEN` | Токен YummyAnime API | — (обязательно)           |
| `NEXT_PUBLIC_API_URL`      | URL backend API         | `http://localhost:5000/api` |

### Получение YummyAnime токена

Токен можно получить через [YummyAnime](https://yummyanime.club/) / их API. Без него каталог и поиск работать не будут.

---

## Usage

### Разработка

**Терминал 1 — Backend:**

```bash
cd backend
export YUMMY_APP_TOKEN=your-token   # или через .env
go run .
```

Сервер: `http://localhost:5000`

**Терминал 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Сайт: `http://localhost:3000`

### Production-сборка

**Frontend:**

```bash
cd frontend
npm run build
npm run start
```

**Backend:**

```bash
cd backend
go build -ldflags="-s -w" -o server .
./server
```

---

## API

### Auth (публичные)

| Метод | Endpoint             | Описание           |
|-------|----------------------|--------------------|
| POST  | `/api/auth/register` | Регистрация        |
| POST  | `/api/auth/login`    | Вход               |

### Auth (защищённые)

| Метод | Endpoint      | Описание       |
|-------|---------------|----------------|
| GET   | `/api/auth/me`| Текущий юзер   |

Header: `Authorization: Bearer <token>`

### User (все требуют Bearer token)

| Метод  | Endpoint                          | Описание                    |
|--------|-----------------------------------|-----------------------------|
| GET    | `/api/user/watchlist`             | Список просмотра            |
| POST   | `/api/user/watchlist`             | Добавить / обновить запись  |
| DELETE | `/api/user/watchlist/{animeId}`   | Удалить из списка           |
| PUT    | `/api/user/watchlist/{animeId}/fav` | Переключить избранное     |
| POST   | `/api/user/progress`              | Сохранить прогресс эпизода  |
| GET    | `/api/user/progress/{animeId}`    | Прогресс по аниме           |

### Anime (прокси к YummyAnime)

| Метод | Endpoint                  | Описание           |
|-------|---------------------------|--------------------|
| GET   | `/api/anime/feed`         | Лента для главной  |
| GET   | `/api/anime/search?q=`    | Поиск              |
| GET   | `/api/anime/list`        | Список с фильтрами  |
| GET   | `/api/anime/{id}/videos` | Эпизоды            |
| GET   | `/api/anime/{urlOrId}`   | Детали тайтла       |

> В текущей версии frontend запрашивает каталог и видео напрямую у `api.yani.tv`. Backend anime endpoints — запасной/альтернативный маршрут.

### Health

| Метод | Endpoint      | Описание    |
|-------|---------------|-------------|
| GET   | `/api/health` | `{"status":"ok"}` |

---

## Deployment

### Docker Compose

```bash
# Установить переменные
export JWT_SECRET=strong-random-secret
export YUMMY_APP_TOKEN=your-token

# Запуск
docker-compose up --build -d
```

- Frontend: собрать и раздавать отдельно (Vercel, nginx и т.п.)
- Backend: `http://localhost:5000` (или внешний порт)
- PostgreSQL: внутренняя сеть
- Redis: поднят, но не используется

### Варианты хостинга

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Render, Fly.io, VPS
- **PostgreSQL:** Railway, Supabase, Neon, собственный сервер

Для production обязательно:

1. Установить `JWT_SECRET`
2. Настроить `CORS_ORIGINS` для вашего домена
3. Указать `NEXT_PUBLIC_API_URL` на прод-URL backend

---

## Contributing

1. Сделать fork репозитория
2. Создать ветку: `git checkout -b feature/your-feature`
3. Внести изменения, проверить: `npm run lint`, `go build ./...`
4. Закоммитить: `git commit -m "feat: add something"`
5. Отправить pull request

Перед PR желательно прогнать линтер и сборку.

---

## Security

- Пароли хешируются через bcrypt (cost 10)
- JWT с ограниченным сроком жизни (7 дней)
- CORS ограничен списком origins
- Секреты (JWT, БД) не коммитятся в репозиторий

Уязвимости можно сообщать в Issues или на почту mantainer'а.

---

## License

MIT

---

## Authors

- HanaAnime Team
