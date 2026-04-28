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
│   ├── client.ts              # apiFetch (base URL, Content-Type, auth header, 204 guard)
│   │                          # FormData-fix: пропускає Content-Type коли body instanceof FormData
│   ├── types.ts               # Shared TypeScript типи (RoleInfo, Sales*, ProductCategory*, Dashboard*, Ribbon*)
│   ├── auth.ts                # login → AdminAuthResponse (включає role?: RoleInfo)
│   ├── orders.ts              # GET /admin/orders, GET /admin/orders/:id, PATCH status
│   ├── products.ts            # GET /admin/products, CRUD, uploadImage, deleteImage, setPreview
│   ├── productCategories.ts   # CRUD /admin/product-categories + subcategories
│   ├── users.ts               # GET /admin/users, GET /admin/users/:id
│   ├── designs.ts             # GET /admin/designs, GET /admin/designs/:id, DELETE /admin/designs/:id
│   ├── admins.ts              # GET/POST /admin/admins, GET/DELETE/:id, PATCH password/role
│   ├── roles.ts               # GET/POST /admin/roles, PUT/DELETE /admin/roles/:id
│   ├── warehouse.ts           # GET stats/categories/products/products/:id, POST transactions, POST products
│   ├── deliveries.ts          # GET/POST /admin/suppliers, GET/POST /admin/deliveries, receive endpoints
│   ├── deliveryMethods.ts     # GET/PUT /admin/delivery-methods (list + detail + update)
│   ├── dashboard.ts           # getDashboard*, getDashboardSalesByCategory(period); SalesCategoryPeriod type
│   ├── info-pages.ts          # GET /admin/info-pages, PUT /admin/info-pages/:slug
│   ├── ribbonPrintTypes.ts    # CRUD /admin/ribbon-print-types
│   ├── ribbonEmblems.ts       # CRUD /admin/ribbon-emblems + uploadRibbonEmblemSvg(id, side, file)
│   └── constructorRules.ts    # CRUD /admin/constructor-rules/incompatibilities + /forced-texts
├── stores/
│   ├── OrdersStore.ts     # MobX — orders list, pagination, status filter
│   ├── ProductsStore.ts   # MobX — products list, pagination, delete
│   ├── UsersStore.ts      # MobX — users list, pagination
│   ├── AuthStore.ts       # MobX — admin auth (JWT token + role info); getters: isSuperAdmin, allowedPages
│   ├── WarehouseStore.ts  # MobX — warehouse products, stats, categories, transactions
│   └── DeliveryStore.ts   # MobX — deliveries, suppliers, delivery details Map, filters
├── components/
│   ├── RibbonEditorPreview.tsx  # SVG-превью стрічки (скопійовано з frontend)
│   │                            # Пропси: mainText, school, className, names, color, textColor,
│   │                            # extraTextColor, font, fontFamily?, emblemKey, emblems?: EmblemEntry[]
│   │                            # EmblemEntry = { sortOrder, svgUrlLeft, svgUrlRight }
│   │                            # EmblemFromUrl: auto-scale SVG via viewBox parsing + ref.current.innerHTML
│   ├── RibbonEditorPreview.css
│   └── layout/
│       └── AdminLayout.tsx  # Sider з вкладеним меню + Header + Content (Outlet)
│                            # Меню фільтрується за role.pages (SuperAdmin бачить все)
│                            # Header показує тег ролі поруч з ім'ям адміна
├── constants/
│   └── ribbonRules.ts       # RibbonColor, Font, RIBBON_COLORS, FONTS, PRINT_TYPES, MATERIALS (без disabled логіки — правила в БД)
└── pages/
    ├── dashboard/DashboardPage.tsx  # 9 блоків: Stats, Статуси+Recent, Distributions, Charts,
    │                                # TopItems+LowStock, Deliveries, Designs, TopProducts, SalesByCategory
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
    │   ├── SavedDesignsPage.tsx   # Таблиця з SVG-превью стрічки в кожному рядку (h=200px), пошук
    │   └── DesignDetailPage.tsx   # Превью, параметри, класи+імена, delete (Popconfirm)
    ├── admins/
    │   ├── AdminsPage.tsx         # Таблиця з колонкою "Роль" (кольоровий тег); select ролі при створенні
    │   └── AdminDetailPage.tsx    # Inline role select (SuperAdmin: іконка олівця → borderless select)
    │                              # Password drawer (SuperAdmin → будь-хто; інші → тільки своя сторінка)
    ├── warehouse/
    │   └── WarehousePage.tsx    # Облік товарів: таблиця продуктів, статистика, прихід/видача
    ├── deliveries/
    │   ├── DeliveriesPage.tsx   # Таблиця поставок з фільтрами, прогрес-бар
    │   ├── DeliveryDetailPage.tsx  # Деталі поставки: позиції, прийом товару, історія прийому (drawer)
    │   └── NewDeliveryPage.tsx  # Повна сторінка створення поставки (dynamic item rows)
    ├── history/
    │   └── HistoryPage.tsx      # (порожньо)
    └── settings/
        ├── CategoriesPage.tsx   # CRUD категорій товарів: ліва панель (категорії) + права (підкатегорії), drawer форми
        ├── DeliveryMethodsPage.tsx    # Таблиця методів (НП, УП), switch активності + кнопка редагувати
        ├── DeliveryMethodDetailPage.tsx  # Налаштування: isEnabled switch, Settings JSON, CheckoutFields editor (таблиця полів)
        ├── PaymentMethodsPage.tsx
        ├── OrderStatusesPage.tsx
        ├── RolesPage.tsx        # CRUD ролей: таблиця, drawer з color picker (10 кольорів) + чекбокси сторінок
        ├── SuppliersPage.tsx    # CRUD постачальників (drawer форма + popconfirm delete)
        ├── InfoPageEditPage.tsx # Редактор інформаційних сторінок (markdown textarea + save)
        └── constructor/
            ├── ColorsPage.tsx
            ├── MaterialsPage.tsx
            ├── PrintColorsPage.tsx
            ├── FontsPage.tsx
            ├── PrintTypesPage.tsx   # CRUD типів друку (Name, Slug, PriceModifier, SortOrder, IsActive)
            ├── EmblemsPage.tsx      # CRUD емблем + окремий SVG upload ліва/права
            │                        # Превью на білому фоні (56×56), upload тільки в drawer
            │                        # handleUpload(side, file) → uploadRibbonEmblemSvg(id, side, file)
            └── RulesPage.tsx        # Scratch-подібний UI для правил конструктора
                                     # Вкладка "Несумісності": блоки [поле][slug]→[недоступні|попередження][поле]: checkboxes
                                     # Вкладка "Фіксований текст": блоки [поле][slug]→[targetField]: tag chips
                                     # Slug-дропдауни завантажуються з API (printTypes, materials, fonts, printColors, colors, emblems)
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
/designs/:id        → DesignDetailPage
/admins             → AdminsPage
/admins/:id         → AdminDetailPage
/warehouse          → WarehousePage
/deliveries         → DeliveriesPage
/deliveries/new     → NewDeliveryPage
/deliveries/:id     → DeliveryDetailPage
/settings/delivery           → DeliveryMethodsPage
/settings/delivery/:id       → DeliveryMethodDetailPage
/settings/suppliers          → SuppliersPage
/settings/roles              → RolesPage
/settings/info-pages/:slug   → InfoPageEditPage  (slug: privacy | terms | delivery)
/settings/constructor/colors        → ColorsPage
/settings/constructor/materials     → MaterialsPage
/settings/constructor/print-colors  → PrintColorsPage
/settings/constructor/fonts         → FontsPage
/settings/constructor/print-types   → PrintTypesPage
/settings/constructor/emblems       → EmblemsPage
/settings/constructor/rules         → RulesPage
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
  Постачальники           (/settings/suppliers)
  Ролі
  Інформаційні сторінки ▶
    Політика конфіденційності  (/settings/info-pages/privacy)
    Умови використання          (/settings/info-pages/terms)
    Доставка та оплата          (/settings/info-pages/delivery)
  Конструктор ▶
    Кольори          (/settings/constructor/colors)
    Матеріали        (/settings/constructor/materials)
    Кольори друку    (/settings/constructor/print-colors)
    Шрифти           (/settings/constructor/fonts)
    Типи друку       (/settings/constructor/print-types)
    Емблеми          (/settings/constructor/emblems)
    Правила          (/settings/constructor/rules)
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
| GET    | /api/v1/admin/designs                                 | Всі збережені дизайни (paginated, з state) |
| GET    | /api/v1/admin/designs/{id}                            | Деталі дизайну (з state + classes)       |
| DELETE | /api/v1/admin/designs/{id}                            | Soft delete дизайну → 204               |
| GET    | /api/v1/admin/admins                                  | Список адмінів (paginated, з role)       |
| GET    | /api/v1/admin/admins/{id}                             | Деталі адміна (з lastLoginAt + role)     |
| POST   | /api/v1/admin/admins                                  | Створити адміна (з roleId?)              |
| DELETE | /api/v1/admin/admins/{id}                             | Soft delete адміна                       |
| PATCH  | /api/v1/admin/admins/{id}/password                    | Змінити пароль → 204                     |
| PATCH  | /api/v1/admin/admins/{id}/role                        | Змінити роль → AdminAdminDetailResponse  |
| GET    | /api/v1/admin/roles                                   | Список ролей                             |
| POST   | /api/v1/admin/roles                                   | Створити роль                            |
| PUT    | /api/v1/admin/roles/{id}                              | Оновити роль (SuperAdmin — заборонено)   |
| DELETE | /api/v1/admin/roles/{id}                              | Soft delete ролі (SuperAdmin — заборонено)|

### Категорії продуктів (новий модуль)
| Метод  | Шлях                                                            | Опис                                   |
|--------|-----------------------------------------------------------------|----------------------------------------|
| GET    | /api/v1/product-categories                                      | Публічний список категорій + підкатегорій |
| GET    | /api/v1/admin/product-categories                                | Адмін список                           |
| POST   | /api/v1/admin/product-categories                                | Створити категорію                     |
| PUT    | /api/v1/admin/product-categories/{id}                           | Оновити категорію                      |
| DELETE | /api/v1/admin/product-categories/{id}                           | Видалити категорію                     |
| POST   | /api/v1/admin/product-categories/{id}/subcategories             | Створити підкатегорію                  |
| PUT    | /api/v1/admin/product-categories/{catId}/subcategories/{id}     | Оновити підкатегорію                   |
| DELETE | /api/v1/admin/product-categories/{catId}/subcategories/{id}     | Видалити підкатегорію                  |

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

### Інформаційні сторінки
| Метод  | Шлях                                   | Опис                                          |
|--------|----------------------------------------|-----------------------------------------------|
| GET    | /api/v1/info/{slug}                    | Публічний — отримати сторінку за slug         |
| GET    | /api/v1/admin/info-pages               | Список всіх сторінок (адмін)                  |
| PUT    | /api/v1/admin/info-pages/{slug}        | Оновити вміст сторінки (адмін)                |

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

### Методи доставки
| Метод  | Шлях                                               | Опис                                          |
|--------|----------------------------------------------------|-----------------------------------------------|
| GET    | /api/v1/delivery-methods                           | Публічний список активних методів             |
| GET    | /api/v1/admin/delivery-methods                     | Адмін список усіх методів                    |
| GET    | /api/v1/admin/delivery-methods/{id}                | Деталі методу                                 |
| PUT    | /api/v1/admin/delivery-methods/{id}                | Оновити (isEnabled, settings, checkoutFields) |

### Дашборд
| Метод  | Шлях                                               | Опис                                          |
|--------|----------------------------------------------------|-----------------------------------------------|
| GET    | /api/v1/admin/dashboard/sales-by-category?period=  | Продажі за категоріями (week/month/year/all)  |

### Конструктор — типи друку
| Метод  | Шлях                                          | Опис                              |
|--------|-----------------------------------------------|-----------------------------------|
| GET    | /api/v1/ribbon-print-types                    | Публічний список                  |
| GET    | /api/v1/admin/ribbon-print-types              | Адмін список                      |
| POST   | /api/v1/admin/ribbon-print-types              | Створити                          |
| PUT    | /api/v1/admin/ribbon-print-types/{id}         | Оновити                           |
| DELETE | /api/v1/admin/ribbon-print-types/{id}         | Soft delete                       |

### Конструктор — емблеми
| Метод  | Шлях                                          | Опис                              |
|--------|-----------------------------------------------|-----------------------------------|
| GET    | /api/v1/ribbon-emblems                        | Публічний список                  |
| GET    | /api/v1/admin/ribbon-emblems                  | Адмін список                      |
| POST   | /api/v1/admin/ribbon-emblems                  | Створити                          |
| PUT    | /api/v1/admin/ribbon-emblems/{id}             | Оновити                           |
| DELETE | /api/v1/admin/ribbon-emblems/{id}             | Soft delete                       |
| POST   | /api/v1/admin/ribbon-emblems/{id}/svg/left    | Upload SVG ліва (multipart)       |
| POST   | /api/v1/admin/ribbon-emblems/{id}/svg/right   | Upload SVG права (multipart)      |

### Конструктор — правила
| Метод  | Шлях                                                        | Опис                                          |
|--------|-------------------------------------------------------------|-----------------------------------------------|
| GET    | /api/v1/constructor/rules                                   | Публічний — всі правила одним запитом         |
| GET    | /api/v1/admin/constructor-rules/incompatibilities           | Список несумісностей                          |
| POST   | /api/v1/admin/constructor-rules/incompatibilities           | Створити несумісність                         |
| PUT    | /api/v1/admin/constructor-rules/incompatibilities/{id}      | Оновити                                       |
| DELETE | /api/v1/admin/constructor-rules/incompatibilities/{id}      | Soft delete                                   |
| GET    | /api/v1/admin/constructor-rules/forced-texts                | Список правил фіксованого тексту              |
| POST   | /api/v1/admin/constructor-rules/forced-texts                | Створити                                      |
| PUT    | /api/v1/admin/constructor-rules/forced-texts/{id}           | Оновити                                       |
| DELETE | /api/v1/admin/constructor-rules/forced-texts/{id}           | Soft delete                                   |

## Типи даних (api/types.ts)

**Roles:**
- `RoleInfo` — id, name, color, isSuperAdmin, pages[]
- `RoleResponse` — + createdAt
- `CreateRoleRequest` / `UpdateRoleRequest` — name, color, pages[]
- `AdminAdminItem` / `AdminAdminDetail` — тепер мають `role?: RoleInfo`
- `CreateAdminRequest` — тепер має `roleId?: number | null`

**Система ролей:**
- 3 дефолтних ролі: **SuperAdmin** (isSuperAdmin=true, повний доступ), **Manager**, **Warehouse**
- `pages[]` — масив ключів сторінок: `dashboard`, `orders`, `products`, `users`, `designs`, `admins`, `warehouse`, `deliveries`, `history`, `settings.categories`, `settings.delivery-methods`, `settings.payment-methods`, `settings.order-statuses`, `settings.suppliers`, `settings.roles`, `settings.info-pages`, `settings.colors`
- SuperAdmin захищений від зміни/видалення на бекенді
- JWT містить claims: `roleId`, `roleName`, `roleColor`, `isSuperAdmin`, `pages` (JSON)
- `AuthStore` зберігає role в localStorage разом з JWT

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

**Designs:**
- `RibbonClassGroup` — className, names (імена через `\n`)
- `RibbonState` — mainText, school, comment, printType, color, material, textColor, extraTextColor, font, emblemKey, **classes: RibbonClassGroup[]**
- `AdminSavedDesignItem` — id, designName, savedAt, userId, userFullName, userEmail, **state: RibbonState**
- `AdminSavedDesignDetail` extends Item (повертається з GET /:id)
- `RibbonState.classes` зберігається як JSON-масив у полі `State` таблиці `SavedDesigns`
- Відображення: `RibbonEditorPreview` отримує `names` як `string[]` (flatMap по classes)

**Product Categories (нова система):**
- `ProductCategoryResponse` — id, name, order, subcategories[]
- `ProductSubcategoryResponse` — id, categoryId, name, order
- `SaveProductCategoryRequest` / `SaveProductSubcategoryRequest` — name, order
- `AdminProduct.categoryId/categoryName/subcategoryId?/subcategoryName?` — замінили старий enum `Category`
- `SaveProductRequest.categoryId` + `subcategoryId?` (замість string category)
- Чотири дефолтних категорії засіяні в міграції: Стрічки (1), Медалі (2), Грамоти (3), Аксесуари (4)

**Sales by Category (дашборд):**
- `SalesByCategoryResponse` — categories: SalesCategoryEntry[]
- `SalesCategoryEntry` — id, name, totalSold, topProducts[], subcategories[]
- `SalesSubcategoryEntry` — id, categoryId, name, totalSold, topProducts[]
- `SalesProductEntry` — name, quantity
- `SalesCategoryPeriod` = `'week' | 'month' | 'year' | 'all'` (в api/dashboard.ts)

**Delivery Methods:**
- `DeliveryCheckoutField` — key, label, type ('input'|'select'), required, isEnabled, optionsJson (рядок JSON для підвантаження опцій)
- `DeliveryMethodResponse` — id, name, slug, isEnabled, settings (JSON рядок), checkoutFields[]
- `UpdateDeliveryMethodRequest` — isEnabled, settings, checkoutFields[]
- Два фіксованих методи: **Нова Пошта** (slug='nova-poshta', id=1), **Укрпошта** (slug='ukrposhta', id=2)
- Orders.DeliveryMethodId — FK на DeliveryMethods (замінив старий enum DeliveryMethod у DeliveryInfo)
- `AdminDeliveryResponse` тепер має `method` (slug), `methodName` (назва), `postalCode`

**Ribbon Print Types (конструктор):**
- `RibbonPrintTypeResponse` — id, name, slug, priceModifier, isActive, sortOrder
- `SaveRibbonPrintTypeRequest` — name, slug, priceModifier, isActive, sortOrder

**Ribbon Emblems (конструктор):**
- `RibbonEmblemResponse` — id, name, slug, svgUrlLeft (MinIO URL або null), svgUrlRight (MinIO URL або null), isActive, sortOrder
- `SaveRibbonEmblemRequest` — name, slug, isActive, sortOrder
- SVG зберігається в MinIO: `emblems/{id}-left.svg` / `emblems/{id}-right.svg`
- Завантаження через `uploadRibbonEmblemSvg(id, 'left' | 'right', File)` — FormData multipart

**InfoPage:**
- `InfoPageResponse` — id, slug, title, content (markdown), order, updatedAt
- `UpdateInfoPageRequest` — title, content
- Фіксовані slug: `privacy`, `terms`, `delivery`
- Сторінки засіваються `InfoPageSeeder` при першому старті бекенду (якщо таблиця порожня)
- Контент — Markdown; рендериться через `react-markdown` на клієнтському фронті

**Constructor Rules (правила конструктора):**
- `ConstructorIncompatibilityResponse` — id, typeA, slugA, typeB, isWarning, message, slugsB: string[]
- `SaveConstructorIncompatibilityRequest` — typeA, slugA, typeB, isWarning, message, slugsB[]
- `ConstructorForcedTextResponse` — id, triggerType, triggerSlug, targetField, message, values: string[]
- `SaveConstructorForcedTextRequest` — triggerType, triggerSlug, targetField, message, values[]
- `ConstructorRulesResponse` — incompatibilities[], forcedTexts[]
- `typeA/typeB/triggerType` — одне з: `'printType' | 'material' | 'font' | 'textColor' | 'color' | 'emblem'`
- `targetField` — `'mainText' | 'school'`
- `isWarning=false` → кнопка disabled + tooltip; `isWarning=true` → кнопка активна, але показує попередження

## Особливості реалізації

**SalesByCategoryBlock (Block 9 дашборду)** — двоярусна кругова діаграма Recharts:
- Внутрішнє кільце = категорії, зовнішнє = підкатегорії (вирівняні за кутом до батьківської категорії)
- При наведенні на сектор — ліва панель показує заголовок (назва + кількість шт.) + топ 10 продуктів
- За замовчуванням ліва панель показує топ підкатегорій з progress-bar
- Перемикач періоду: Тиждень / Місяць / Рік / Весь час
- `CAT_COLORS` / `CAT_COLORS_LIGHT` — 6 кольорів для внутр/зовн кілець
- `HoverState` = `{ type: 'category' | 'subcategory'; id: number } | null`

**ProductEditPage** — категорія завантажується з API (`getProductCategories`), при зміні категорії — cascading reset підкатегорії.

**DesignDetailPage** — превью `RibbonEditorPreview` отримує всі імена через `flatMap` по `state.classes`, перший клас передається як `className`. Email користувача — `Link` на `/users/:id`.

**WarehousePage** — `TransactionListItem` має дві частини після кількості:
- Колонка "Поставка/Замовлення" (ширина 120px): посилання на `/deliveries/:id` або `/orders/:id` з номером і датою
- Колонка "Нотатка": залишок тексту

**DeliveryDetailPage** — кнопка "і" (InfoCircleOutlined) у діях кожної позиції відкриває Drawer з Timeline прийомів (дата, кількість, нотатка).

**TransactionDrawer** (outcome) — необов'язковий Select "Замовлення" внизу форми: завантажує 100 останніх замовлень, показує номер + дату (secondary style через `optionRender`).

**RulesPage (Scratch-like UI):**
- Дві вкладки: Несумісності / Фіксований текст
- Кожне правило — картка з горизонтальними Select-ами: `Якщо [поле] = [slug] → [недоступні|попередження] [поле]:`
- Slug-опції для кожного типу завантажуються з відповідного ribbon API при завантаженні сторінки
- Збереження per-card (не глобальна кнопка); від'ємні ID для нових (ще не збережених) правил

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

- [ ] Наповнити сторінки налаштувань (доставка, оплата, статуси, кольори)
- [ ] Історія змін
