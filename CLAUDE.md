# Випускник+ Адмінка

Адмін-панель для управління замовленнями, продуктами, користувачами та іншими ресурсами платформи Випускник+.

## Технології

- **React 19** + **TypeScript** + **Vite**
- **Ant Design 6** — UI компоненти (таблиці, форми, drawer, layout)
- **MobX 6** + **mobx-react-lite** — стейт менеджмент (Orders, Products, Users stores)
- **React Router 7** — маршрутизація (BrowserRouter)
- **Tailwind CSS 4** — утилітарні стилі (через `@tailwindcss/vite`)
- **API base URL**: `http://localhost:5272` (env var `VITE_API_URL`)

## Структура проекту

```
src/
├── api/
│   ├── client.ts          # apiFetch утиліта (base URL, Content-Type, auth header)
│   ├── types.ts           # Shared TypeScript типи
│   ├── orders.ts          # GET /admin/orders, GET /admin/orders/:id, PATCH status
│   ├── products.ts        # GET /admin/products, DELETE, uploadImage, deleteImage, setPreview
│   ├── users.ts           # GET /admin/users, GET /admin/users/:id (повні деталі)
│   ├── designs.ts         # GET /admin/designs (всі збережені дизайни)
│   └── admins.ts          # GET/POST /admin/admins, GET/DELETE /admin/admins/:id
├── stores/
│   ├── OrdersStore.ts     # MobX store — orders list, pagination, status filter
│   ├── ProductsStore.ts   # MobX store — products list, pagination, delete
│   ├── UsersStore.ts      # MobX store — users list, pagination
│   └── AuthStore.ts       # MobX store — admin auth (JWT token)
├── components/
│   └── layout/
│       └── AdminLayout.tsx  # Sider з вкладеним меню + Header + Content (Outlet)
└── pages/
    ├── dashboard/DashboardPage.tsx
    ├── orders/
    │   ├── OrdersPage.tsx        # Таблиця + фільтр статусу + inline зміна статусу
    │   └── OrderDetailPage.tsx   # Деталі: позиції (колапс персоналізації), покупець, доставка, оплата
    ├── products/
    │   ├── ProductsPage.tsx      # Таблиця продуктів + soft delete
    │   └── ProductEditPage.tsx   # Редагування/створення: хедер з кнопками, налаштування + фото
    ├── users/
    │   ├── UsersPage.tsx         # Таблиця користувачів, клік → деталі
    │   └── UserDetailPage.tsx    # Картка юзера + таблиця замовлень + збережені дизайни
    ├── designs/
    │   └── SavedDesignsPage.tsx  # Всі збережені дизайни, посилання на юзера
    ├── admins/
    │   ├── AdminsPage.tsx        # Таблиця адмінів + drawer створення + видалення
    │   └── AdminDetailPage.tsx   # Картка адміна (email, дата, lastLoginAt, пароль) + таблиця дій
    ├── warehouse/
    │   └── WarehousePage.tsx     # (порожньо)
    ├── history/
    │   └── HistoryPage.tsx       # (порожньо)
    └── settings/
        ├── CategoriesPage.tsx    # (порожньо)
        ├── DeliveryMethodsPage.tsx
        ├── PaymentMethodsPage.tsx
        ├── OrderStatusesPage.tsx
        ├── RolesPage.tsx
        └── constructor/
            └── ColorsPage.tsx    # (порожньо)
```

## Меню (AdminLayout)

Сайдбар з вкладеними підменю. Підменю `Налаштування` і `Конструктор` розкриваються стрілкою.

```
Дашборд
Замовлення
Продукти
Користувачі
Збережені дизайни
Адміни
Складський облік
Історія змін
Налаштування ▶
  Категорії товарів
  Методи доставки
  Методи оплати
  Статуси замовлень
  Ролі
  Конструктор ▶
    Кольори
```

`openKeys` обчислюються з `pathname` (settings/* → відкрито 'settings'; settings/constructor/* → відкрито і 'constructor').

## API ендпоінти (бекенд)

| Метод  | Шлях                                                  | Опис                                     |
|--------|-------------------------------------------------------|------------------------------------------|
| GET    | /api/v1/admin/orders                                  | Всі замовлення (paginated, фільтр status)|
| GET    | /api/v1/admin/orders/{id}                             | Деталі замовлення                         |
| PATCH  | /api/v1/admin/orders/{id}/status                      | Оновити статус                            |
| GET    | /api/v1/admin/products                                | Всі продукти (з IsDeleted)               |
| GET    | /api/v1/admin/products/{id}                           | Деталі продукту (включно з images[])     |
| PUT    | /api/v1/admin/products/{id}                           | Зберегти продукт                          |
| POST   | /api/v1/admin/products                                | Створити продукт                          |
| DELETE | /api/v1/admin/products/{id}                           | Soft delete продукту                      |
| POST   | /api/v1/admin/products/{id}/images                    | Завантажити фото (multipart, ліміт 10MB) |
| DELETE | /api/v1/admin/products/{id}/images/{imageId}          | Видалити фото                             |
| PATCH  | /api/v1/admin/products/{id}/images/{imageId}/preview  | Зробити фото превʼю                      |
| GET    | /api/v1/admin/users                                   | Всі користувачі (paginated)              |
| GET    | /api/v1/admin/users/{id}                              | Деталі юзера: info + orders[] + savedDesigns[] |
| GET    | /api/v1/admin/designs                                 | Всі збережені дизайни (paginated)        |
| GET    | /api/v1/admin/admins                                  | Список адмінів (paginated)               |
| GET    | /api/v1/admin/admins/{id}                             | Деталі адміна (з lastLoginAt)            |
| POST   | /api/v1/admin/admins                                  | Створити адміна                           |
| DELETE | /api/v1/admin/admins/{id}                             | Soft delete адміна                        |

## Типи даних (api/types.ts)

**OrderStatus**: `Accepted | Production | Shipped | Delivered`

**AdminUser** — список юзерів: id, email, fullName, phone, createdAt, ordersCount

**AdminUserDetail** — деталі юзера: + `orders: AdminUserOrderSummary[]` + `savedDesigns: AdminUserSavedDesign[]`

**AdminSavedDesignItem** — глобальна таблиця дизайнів: id, designName, savedAt, userId, userFullName, userEmail

**AdminAdminItem** — список адмінів: id, email, fullName, createdAt

**AdminAdminDetail** — деталі адміна: + `lastLoginAt: string | null`

**AdminProductDetail** — містить `images: ProductImageItem[]` (id, imageUrl, isPreview)

**AdminOrderItem** — містить `namesData: NamesData | null` і `ribbonCustomization: RibbonCustomization | null`

## Правила ID

**Всі ID завжди `bigint`**:
- DB: `BIGINT` | Backend C#: `long` | Frontend TypeScript: `number`

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

# Перевірити логи після запуску
docker logs prod-api-1 --tail 50
```

**Автоміграції** — `MigrateAsync()` в `Program.cs` запускається при старті.

**Якщо треба скинути БД на сервері:**
```bash
docker stop prod-api-1
docker exec prod-db-1 psql -U postgres -c "DROP DATABASE vypusknyk_plus;"
docker exec prod-db-1 psql -U postgres -c "CREATE DATABASE vypusknyk_plus;"
docker start prod-api-1
```

**Локальна БД** — `appsettings.Development.json`, `Host=localhost;Port=5432;Database=vypusknyk_plus;Username=postgres;Password=postgres`

## Nginx (сервер)

Конфіг: `/etc/nginx/sites-enabled/vypusknyk`

- `client_max_body_size 15m;` — для завантаження фото
- `location /storage/ { proxy_pass http://localhost:9000/; }` — проксі до MinIO

**MinIO** — публічний endpoint: `https://75.119.152.4.sslip.io/storage`. Змінна `MINIO_PUBLIC_ENDPOINT` в docker-compose.

## Бекенд — важливі патерни

- **EF Core JSONB**: `OwnsOne(e => e.Field, b => { b.ToJson(); ... })` для value objects
- **Global query filters**: `HasQueryFilter(e => !e.IsDeleted)` є на: User, Order, OrderItem, SavedDesign, CartItem, Product, Admin. В адмін-сервісах завжди використовувати `IgnoreQueryFilters()` + явний `.Where(!e.IsDeleted)` де потрібно
- **Admin auth**: Super admin — через env vars `Admin:Email`/`Admin:Password` (не в БД, id=0). DB admins — BCrypt, `LastLoginAt` оновлюється при кожному логіні

## TODO

- [ ] Підключити реальні дані до Дашборду
- [ ] CORS: додати admin URL до `Cors:AllowedOrigins` при деплої
- [ ] Деплой бекенду з міграціями `AddProductImages`, `AddOrderItemPersonalization`, `AddAdminLastLoginAt`
- [ ] Реалізувати зміну пароля адміна (кнопка є, логіки немає)
- [ ] Наповнити сторінки налаштувань (категорії, доставка, оплата, статуси, ролі, кольори)
- [ ] Складський облік та Історія змін
