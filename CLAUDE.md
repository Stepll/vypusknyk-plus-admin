# Випускник+ Адмінка

Адмін-панель для управління замовленнями, продуктами, користувачами та іншими ресурсами платформи Випускник+.

## Технології

- **React 19** + **TypeScript** + **Vite**
- **Ant Design 6** — UI компоненти (таблиці, форми, drawer, layout)
- **MobX 6** + **mobx-react-lite** — стейт менеджмент
- **React Router 7** — маршрутизація (BrowserRouter)
- **Tailwind CSS 4** — утилітарні стилі (через `@tailwindcss/vite`)
- **API base URL**: `http://localhost:5272` (env var `VITE_API_URL`)

## Структура проекту

```
src/
├── api/
│   ├── client.ts          # apiFetch (base URL, Content-Type, auth header, 204 guard)
│   ├── types.ts           # Shared TypeScript типи
│   ├── orders.ts          # GET /admin/orders, GET /admin/orders/:id, PATCH status
│   ├── products.ts        # GET /admin/products, CRUD, uploadImage, deleteImage, setPreview
│   ├── users.ts           # GET /admin/users, GET /admin/users/:id
│   ├── designs.ts         # GET /admin/designs
│   ├── admins.ts          # GET/POST /admin/admins, GET/DELETE /admin/admins/:id
│   ├── warehouse.ts       # GET stats/categories/products/products/:id, POST transactions, POST products
│   └── deliveries.ts      # GET/POST /admin/suppliers, GET/POST /admin/deliveries, receive endpoints
├── stores/
│   ├── OrdersStore.ts     # MobX — orders list, pagination, status filter
│   ├── ProductsStore.ts   # MobX — products list, pagination, delete
│   ├── UsersStore.ts      # MobX — users list, pagination
│   ├── AuthStore.ts       # MobX — admin auth (JWT token)
│   ├── WarehouseStore.ts  # MobX — warehouse products, stats, categories, transactions
│   └── DeliveryStore.ts   # MobX — deliveries, suppliers, delivery details Map, filters
├── components/
│   └── layout/
│       └── AdminLayout.tsx  # Sider з вкладеним меню + Header + Content (Outlet)
└── pages/
    ├── dashboard/DashboardPage.tsx
    ├── orders/
    │   ├── OrdersPage.tsx
    │   └── OrderDetailPage.tsx
    ├── products/
    │   ├── ProductsPage.tsx
    │   └── ProductEditPage.tsx
    ├── users/
    │   ├── UsersPage.tsx
    │   └── UserDetailPage.tsx
    ├── designs/
    │   └── SavedDesignsPage.tsx
    ├── admins/
    │   ├── AdminsPage.tsx
    │   └── AdminDetailPage.tsx
    ├── warehouse/
    │   └── WarehousePage.tsx    # Облік товарів: таблиця продуктів, статистика, прихід/видача
    ├── deliveries/
    │   ├── DeliveriesPage.tsx   # Таблиця поставок з фільтрами, прогрес-бар
    │   ├── DeliveryDetailPage.tsx  # Деталі поставки: позиції, прийом товару, історія прийому (drawer)
    │   └── NewDeliveryPage.tsx  # Повна сторінка створення поставки (dynamic item rows)
    ├── history/
    │   └── HistoryPage.tsx      # (порожньо)
    └── settings/
        ├── CategoriesPage.tsx
        ├── DeliveryMethodsPage.tsx
        ├── PaymentMethodsPage.tsx
        ├── OrderStatusesPage.tsx
        ├── RolesPage.tsx
        ├── SuppliersPage.tsx    # CRUD постачальників (drawer форма + popconfirm delete)
        └── constructor/
            └── ColorsPage.tsx
```

## Маршрути (App.tsx)

```
/                   → DashboardPage
/orders             → OrdersPage
/orders/:id         → OrderDetailPage
/products           → ProductsPage
/products/:id       → ProductEditPage
/users              → UsersPage
/users/:id          → UserDetailPage
/designs            → SavedDesignsPage
/admins             → AdminsPage
/admins/:id         → AdminDetailPage
/warehouse          → WarehousePage
/deliveries         → DeliveriesPage
/deliveries/new     → NewDeliveryPage
/deliveries/:id     → DeliveryDetailPage
/settings/suppliers → SuppliersPage
/settings/roles     → RolesPage
... (інші settings)
```

## Меню (AdminLayout)

```
Дашборд
Замовлення
Продукти
Користувачі
Збережені дизайни
Адміни
Складський облік   (/warehouse)
Поставки           (/deliveries)
Історія змін
Налаштування ▶
  Категорії товарів
  Методи доставки
  Методи оплати
  Статуси замовлень
  Постачальники      (/settings/suppliers)
  Ролі
  Конструктор ▶
    Кольори
```

## API ендпоінти (бекенд)

### Замовлення / Продукти / Юзери / Адміни
| Метод  | Шлях                                                  | Опис                                     |
|--------|-------------------------------------------------------|------------------------------------------|
| GET    | /api/v1/admin/orders                                  | Всі замовлення (paginated, фільтр status)|
| GET    | /api/v1/admin/orders/{id}                             | Деталі замовлення                        |
| PATCH  | /api/v1/admin/orders/{id}/status                      | Оновити статус                           |
| GET    | /api/v1/admin/products                                | Всі продукти (з IsDeleted)               |
| GET    | /api/v1/admin/products/{id}                           | Деталі + images[]                        |
| POST   | /api/v1/admin/products                                | Створити продукт                         |
| PUT    | /api/v1/admin/products/{id}                           | Оновити продукт                          |
| DELETE | /api/v1/admin/products/{id}                           | Soft delete                              |
| POST   | /api/v1/admin/products/{id}/images                    | Завантажити фото (multipart, 10MB)       |
| DELETE | /api/v1/admin/products/{id}/images/{imageId}          | Видалити фото                            |
| PATCH  | /api/v1/admin/products/{id}/images/{imageId}/preview  | Встановити превʼю                        |
| GET    | /api/v1/admin/users                                   | Всі юзери (paginated)                    |
| GET    | /api/v1/admin/users/{id}                              | Деталі + orders[] + savedDesigns[]       |
| GET    | /api/v1/admin/designs                                 | Всі збережені дизайни (paginated)        |
| GET    | /api/v1/admin/admins                                  | Список адмінів (paginated)               |
| GET    | /api/v1/admin/admins/{id}                             | Деталі адміна (з lastLoginAt)            |
| POST   | /api/v1/admin/admins                                  | Створити адміна                          |
| DELETE | /api/v1/admin/admins/{id}                             | Soft delete адміна                       |

### Складський облік
| Метод  | Шлях                                        | Опис                                        |
|--------|---------------------------------------------|---------------------------------------------|
| GET    | /api/v1/admin/warehouse/stats               | Загальна статистика складу                  |
| GET    | /api/v1/admin/warehouse/categories          | Категорії складських товарів                |
| GET    | /api/v1/admin/warehouse/subcategories       | Підкатегорії складських товарів             |
| GET    | /api/v1/admin/warehouse/products            | Список товарів (paginated, фільтри)         |
| GET    | /api/v1/admin/warehouse/products/{id}       | Деталі: варіанти + транзакції               |
| POST   | /api/v1/admin/warehouse/products            | Створити складський товар                   |
| POST   | /api/v1/admin/warehouse/transactions        | Додати транзакцію (прихід/видача)           |

### Поставки та Постачальники
| Метод  | Шлях                                                          | Опис                                   |
|--------|---------------------------------------------------------------|----------------------------------------|
| GET    | /api/v1/admin/suppliers                                       | Список постачальників                  |
| POST   | /api/v1/admin/suppliers                                       | Створити постачальника                 |
| PUT    | /api/v1/admin/suppliers/{id}                                  | Оновити постачальника                  |
| DELETE | /api/v1/admin/suppliers/{id}                                  | Soft delete постачальника              |
| GET    | /api/v1/admin/deliveries                                      | Список поставок (paginated, фільтри)   |
| GET    | /api/v1/admin/deliveries/{id}                                 | Деталі поставки (з позиціями + історією прийому) |
| POST   | /api/v1/admin/deliveries                                      | Створити поставку                      |
| POST   | /api/v1/admin/deliveries/{id}/items/{itemId}/receive          | Прийняти позицію (часткове)            |
| POST   | /api/v1/admin/deliveries/{id}/receive-all                     | Прийняти всі позиції → 204             |

## Типи даних (api/types.ts)

**OrderStatus**: `Accepted | Production | Shipped | Delivered`

**Warehouse:**
- `StockMaterial`: `'Atlas' | 'Satin' | 'Silk'`
- `StockStatus`: `'in_stock' | 'low_stock' | 'out_of_stock'`
- `StockProductSummary` — subcategoryId/Name, categoryId/Name, hasColor, hasMaterial, totalStock, variantCount, status
- `StockProductDetail` — variants[], transactions[]
- `StockVariantResponse` — id, material, color, currentStock (обчислений)
- `StockTransactionResponse` — deliveryItemId?, deliveryId?, orderId?, orderNumber?, orderCreatedAt?, type, quantity, date, note
- `CreateStockTransactionRequest` — productId, material, color, type, quantity, date, note, orderId?

**Deliveries:**
- `DeliveryStatus`: `'pending' | 'partial' | 'received'`
- `DeliverySummary` — number, supplierName?, expectedDate, status, itemCount, totalExpectedQty, totalReceivedQty
- `DeliveryDetail` — + items: DeliveryItemResponse[]
- `DeliveryItemResponse` — productName, subcategoryName, categoryName, hasColor, hasMaterial, material, color, expectedQty, receivedQty, receivedAt?, **receiveHistory: ReceiveTransactionInfo[]**
- `ReceiveTransactionInfo` — id, quantity, date, note, createdAt
- `SupplierResponse` — name, contactPerson?, phone?, email?, taxId?, address?, notes?

## Особливості реалізації

**WarehousePage** — `TransactionListItem` має дві частини після кількості:
- Колонка "Поставка/Замовлення" (ширина 120px): посилання на `/deliveries/:id` або `/orders/:id` з номером і датою
- Колонка "Нотатка": залишок тексту

**DeliveryDetailPage** — кнопка "і" (InfoCircleOutlined) у діях кожної позиції відкриває Drawer з Timeline прийомів (дата, кількість, нотатка).

**TransactionDrawer** (outcome) — необов'язковий Select "Замовлення" внизу форми: завантажує 100 останніх замовлень, показує номер + дату (secondary style через `optionRender`).

## Правила ID

**Всі ID завжди `bigint`**: DB: `BIGINT` | Backend C#: `long` | Frontend TypeScript: `number`

## Команди

```bash
npm run dev      # http://localhost:5174
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
```

## Конфігурація

- Копіюй `.env.example` → `.env` і заповни `VITE_API_URL`
- `vercel.json` — SPA rewrites для Vercel деплою

## Деплой

Окремий проект на Vercel. `VITE_API_URL` встановити в Vercel env vars.

## Деплой бекенду (Docker)

```bash
# 1. Локально
cd /Users/stepankobrii/Documents/Projects/vypusknyk-plus-backend
docker buildx build --platform linux/amd64 -t stepll/vypusknyk-plus:latest --push .

# 2. На сервері vmi3229320
cd ~/vypusknyk-plus/prod
docker compose pull && docker compose up -d
docker logs prod-api-1 --tail 50
```

**Автоміграції** — `MigrateAsync()` в `Program.cs` при старті.

## Бекенд — важливі патерни

- **Global query filters** (`!e.IsDeleted`) на: User, Order, OrderItem, SavedDesign, CartItem, Product, Admin, **Supplier, Delivery**. При Include навігації з query filter — обов'язково завантажувати через окремий запит з `IgnoreQueryFilters()` щоб уникнути null.
- **apiFetch** — перевіряє `res.status === 204` перед `res.json()`. Ендпоінти що повертають "порожній успіх" мусять повертати 204, не 200.

## TODO

- [ ] Підключити реальні дані до Дашборду
- [ ] Реалізувати зміну пароля адміна
- [ ] Наповнити сторінки налаштувань (категорії, доставка, оплата, статуси, кольори)
- [ ] Історія змін
