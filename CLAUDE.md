# Випускник+ Адмінка

Адмін-панель для управління замовленнями, продуктами та користувачами платформи Випускник+.

## Технології

- **React 19** + **TypeScript** + **Vite**
- **Ant Design 6** — UI компоненти (таблиці, форми, layout)
- **MobX 6** + **mobx-react-lite** — стейт менеджмент
- **React Router 7** — маршрутизація (BrowserRouter)
- **Tailwind CSS 4** — утилітарні стилі (через `@tailwindcss/vite`)
- **API base URL**: `http://localhost:5272` (env var `VITE_API_URL`)

## Структура проекту

```
src/
├── api/
│   ├── client.ts          # apiFetch утиліта (base URL, Content-Type)
│   ├── types.ts           # Shared TypeScript типи (AdminOrder, AdminProduct, AdminUser, PagedResponse)
│   ├── orders.ts          # GET /admin/orders, GET /admin/orders/:id, PATCH status
│   ├── products.ts        # GET /admin/products, DELETE, uploadImage
│   └── users.ts           # GET /admin/users, GET /admin/users/:id
├── stores/
│   ├── OrdersStore.ts     # MobX store — orders list, pagination, status filter
│   ├── ProductsStore.ts   # MobX store — products list, pagination, delete
│   └── UsersStore.ts      # MobX store — users list, pagination
├── components/
│   └── layout/
│       └── AdminLayout.tsx  # Ant Design Sider + Header + Content (Outlet)
└── pages/
    ├── dashboard/DashboardPage.tsx   # Статистика (TODO: підключити реальні дані)
    ├── orders/OrdersPage.tsx         # Таблиця замовлень + фільтр статусу + inline зміна статусу
    ├── products/ProductsPage.tsx     # Таблиця продуктів + soft delete
    └── users/UsersPage.tsx           # Таблиця користувачів
```

## API ендпоінти (бекенд)

Всі admin ендпоінти — в існуючому `VypusknykPlus.Api`, без авторизації (поки що).

| Метод  | Шлях                              | Опис                        |
|--------|-----------------------------------|-----------------------------|
| GET    | /api/v1/admin/orders              | Всі замовлення (paginated)  |
| GET    | /api/v1/admin/orders/{id}         | Деталі замовлення            |
| PATCH  | /api/v1/admin/orders/{id}/status  | Оновити статус               |
| GET    | /api/v1/admin/products            | Всі продукти (з IsDeleted)  |
| DELETE | /api/v1/admin/products/{id}       | Soft delete продукту         |
| GET    | /api/v1/admin/users               | Всі користувачі (paginated) |
| GET    | /api/v1/admin/users/{id}          | Деталі користувача           |

## Типи даних

**OrderStatus** (enum з бекенду): `Accepted | Production | Shipped | Delivered`

**User** — має поле `fullName: string` (одне поле, не `firstName + lastName`)

## Правила ID

**Всі ID завжди `bigint`** — це обов'язкове правило проекту:
- DB: `BIGINT`
- Backend C#: `long`
- Frontend TypeScript: `number`

`SavedDesign.id` у `AuthStore.ts` має тип `number | string` — `string` використовується тільки для тимчасових optimistic update ID (до синхронізації з сервером).

## Команди

```bash
npm run dev      # http://localhost:5174 (або наступний вільний порт)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
```

## Конфігурація

- Копіюй `.env.example` → `.env` і заповни `VITE_API_URL`
- `vercel.json` — SPA rewrites для Vercel деплою

## Деплой

Окремий проект на Vercel. `VITE_API_URL` встановити в Vercel env vars.

## Деплой бекенду (Docker)

Бекенд на сервері `vmi3229320` в Docker. Флоу деплою:

```bash
# 1. Локально — зібрати і запушити image (обов'язково --platform linux/amd64, сервер amd64)
cd /Users/stepankobrii/Documents/Projects/vypusknyk-plus-backend
docker buildx build --platform linux/amd64 -t stepll/vypusknyk-plus:latest --push .

# 2. На сервері
cd ~/vypusknyk-plus/prod
docker compose pull && docker compose up -d
```

**Автоміграції** — `MigrateAsync()` в `Program.cs` запускається при старті, міграції застосовуються автоматично.

**Якщо треба скинути БД на сервері:**
```bash
docker stop prod-api-1
docker exec prod-db-1 psql -U postgres -c "DROP DATABASE vypusknyk_plus;"
docker exec prod-db-1 psql -U postgres -c "CREATE DATABASE vypusknyk_plus;"
docker start prod-api-1
```

**Локальна БД** — `appsettings.Development.json`, `Host=localhost;Port=5432;Database=vypusknyk_plus;Username=postgres;Password=postgres`

## TODO

- [ ] Підключити реальні дані до Дашборду (кількість замовлень, продуктів, юзерів)
- [ ] Сторінка деталей замовлення
- [ ] Форма редагування/створення продукту
- [ ] Завантаження зображень продуктів
- [ ] Аутентифікація адміна (роль Admin + JWT) ✅ зроблено
- [ ] CORS: додати admin URL до `Cors:AllowedOrigins` в бекенді при деплої
