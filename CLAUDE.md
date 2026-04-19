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
│   ├── products.ts        # GET /admin/products, DELETE, uploadImage, deleteImage, setPreview
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
    ├── orders/OrdersPage.tsx         # Таблиця замовлень + фільтр статусу + inline зміна статусу + клік → деталі
    ├── orders/OrderDetailPage.tsx    # Деталі замовлення: позиції (колапс персоналізації), покупець, доставка, оплата
    ├── products/ProductsPage.tsx     # Таблиця продуктів + soft delete
    ├── products/ProductEditPage.tsx  # Редагування/створення продукту: хедер з кнопками, ліва колонка налаштувань, права карточка фото
    └── users/UsersPage.tsx           # Таблиця користувачів
```

## API ендпоінти (бекенд)

Всі admin ендпоінти — в існуючому `VypusknykPlus.Api`.

| Метод  | Шлях                                          | Опис                                     |
|--------|-----------------------------------------------|------------------------------------------|
| GET    | /api/v1/admin/orders                          | Всі замовлення (paginated)               |
| GET    | /api/v1/admin/orders/{id}                     | Деталі замовлення                         |
| PATCH  | /api/v1/admin/orders/{id}/status              | Оновити статус                            |
| GET    | /api/v1/admin/products                        | Всі продукти (з IsDeleted)               |
| GET    | /api/v1/admin/products/{id}                   | Деталі продукту (включно з images[])     |
| PUT    | /api/v1/admin/products/{id}                   | Зберегти продукт                          |
| POST   | /api/v1/admin/products                        | Створити продукт                          |
| DELETE | /api/v1/admin/products/{id}                   | Soft delete продукту                      |
| POST   | /api/v1/admin/products/{id}/images            | Завантажити фото (multipart, ліміт 10MB) |
| DELETE | /api/v1/admin/products/{id}/images/{imageId}  | Видалити фото                             |
| PATCH  | /api/v1/admin/products/{id}/images/{imageId}/preview | Зробити фото превʼю              |
| GET    | /api/v1/admin/users                           | Всі користувачі (paginated)              |
| GET    | /api/v1/admin/users/{id}                      | Деталі користувача                        |

## Типи даних

**OrderStatus** (enum з бекенду): `Accepted | Production | Shipped | Delivered`

**User** — має поле `fullName: string` (одне поле, не `firstName + lastName`)

**AdminOrderItem** — містить `namesData: NamesData | null` і `ribbonCustomization: RibbonCustomization | null` — зберігаються як JSONB в БД через EF Core `OwnsOne().ToJson()`.

**AdminProductDetail** — містить `images: ProductImageItem[]` (id, imageUrl, isPreview). Превʼю також дублюється в `Product.ImageKey` для зворотньої сумісності.

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

## Nginx (сервер)

Конфіг: `/etc/nginx/sites-enabled/vypusknyk` (або `/etc/nginx/sites-available/vypusknyk`)

Важливі налаштування що були додані:
- `client_max_body_size 15m;` — для завантаження фото (без цього nginx повертає 413)
- `location /storage/ { proxy_pass http://localhost:9000/; }` — проксі до MinIO (порт 9000 не відкритий зовні)

**MinIO** — публічний endpoint: `https://75.119.152.4.sslip.io/storage` (через nginx proxy). Змінна `MINIO_PUBLIC_ENDPOINT` в docker-compose.

## Бекенд — важливі патерни

- **EF Core JSONB**: `OwnsOne(e => e.Field, b => { b.ToJson(); ... })` для зберігання value objects як JSON колонок
- **Global query filters**: `HasQueryFilter(e => !e.IsDeleted)` — при перевірці унікальності email (реєстрація) треба `IgnoreQueryFilters()` щоб не пропустити soft-deleted записи
- **Middleware order**: `UseSerilogRequestLogging()` має бути ДО `UseMiddleware<ExceptionHandlingMiddleware>()` — інакше Serilog логує до того як exception middleware встановлює правильний статус код

## TODO

- [ ] Підключити реальні дані до Дашборду (кількість замовлень, продуктів, юзерів)
- [x] Сторінка деталей замовлення
- [x] Форма редагування/створення продукту
- [x] Завантаження зображень продуктів (мульти-фото, превʼю, видалення)
- [x] Аутентифікація адміна (роль Admin + JWT)
- [ ] CORS: додати admin URL до `Cors:AllowedOrigins` в бекенді при деплої
- [ ] Деплой бекенду з міграціями `AddProductImages` + `AddOrderItemPersonalization`
