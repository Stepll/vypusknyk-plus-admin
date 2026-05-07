# Випускник+ Адмінка

Адмін-панель для управління замовленнями, продуктами, користувачами та іншими ресурсами платформи Випускник+.

## Технології

- **React 19** + **TypeScript** + **Vite**
- **Ant Design 6** — UI компоненти (таблиці, форми, drawer, layout)
- **MobX 6** + **mobx-react-lite** — стейт менеджмент
- **React Router 7** — маршрутизація (BrowserRouter)
- **Tailwind CSS 4** — утилітарні стилі (через `@tailwindcss/vite`)
- **xlsx (SheetJS)** — генерація та парсинг Excel файлів (export/import)
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
│   │                          # getAllProducts() — пагінований fetch усіх продуктів для Excel-експорту
│   ├── productCategories.ts   # CRUD /admin/product-categories + subcategories
│   ├── users.ts               # GET /admin/users, GET /admin/users/:id, PATCH info/verification,
│   │                          # sendUserActivationEmail, apiFetch → POST send-email
│   ├── designs.ts             # GET /admin/designs, GET /admin/designs/:id, DELETE /admin/designs/:id
│   ├── badgeDesigns.ts        # getBadgeDesigns(page,size), getBadgeDesign(id), deleteBadgeDesign(id), getBadgeDesignsByUser(userId)
│   ├── badgeTextColors.ts     # getBadgeTextColors() → BadgeTextColorResponse[]
│   ├── badgeFonts.ts          # getBadgeFonts() → BadgeFontResponse[]
│   ├── badgeImages.ts         # getBadgeImages() → BadgeImageResponse[]
│   ├── certificateDesigns.ts  # getCertificateDesigns(page,size), getCertificateDesign(id), getCertificateDesignsByUser(userId), deleteCertificateDesign(id)
│   ├── certificateTemplates.ts # CRUD /admin/certificate-templates + uploadCertificateTemplateImage(id, file)
│   │                           # saveCertificateTemplateLayout(id, data) → PUT /{id}/layout
│   │                           # getCertificateTemplateById(id) → GET /{id}
│   ├── certificatePaperTypes.ts # CRUD /admin/certificate-paper-types
│   ├── certificateFonts.ts    # CRUD /admin/certificate-fonts
│   ├── admins.ts              # GET/POST /admin/admins, GET/DELETE/:id, PATCH password/role
│   ├── roles.ts               # GET/POST /admin/roles, PUT/DELETE /admin/roles/:id
│   ├── warehouse.ts           # GET stats/categories/products/products/:id, POST transactions, POST products
│   ├── deliveries.ts          # GET/POST /admin/suppliers, GET/POST /admin/deliveries, receive endpoints
│   ├── deliveryMethods.ts     # GET/PUT /admin/delivery-methods (list + detail + update)
│   ├── dashboard.ts           # getDashboard*, getDashboardSalesByCategory(period); SalesCategoryPeriod type
│   ├── info-pages.ts          # GET /admin/info-pages, PUT /admin/info-pages/:slug
│   ├── ribbonPrintTypes.ts    # CRUD /admin/ribbon-print-types
│   ├── ribbonEmblems.ts       # CRUD /admin/ribbon-emblems + uploadRibbonEmblemSvg(id, side, file)
│   ├── constructorRules.ts    # CRUD /admin/constructor-rules/incompatibilities + /forced-texts
│   ├── chat.ts                # ChatMessageDto, ChatConversationListItem; getConversations(), getConversationMessages(id)
│   ├── promotions.ts          # AdminPromotionResponse (scope: Global/Category/Volume/Bundle, targets[], volumeTiers[], bundleItems[]),
│   │                          # AdminPromoCodeResponse (code?: string — nullable для task-only),
│   │                          # SavePromotionRequest (targetCategoryIds[], targetSubcategoryIds[], volumeTiers[], bundleItems[]),
│   │                          # SavePromoCodeRequest (code?: string — optional),
│   │                          # CartItemForDiscount, getAdminPromotions, getAdminPromotion(id), getAdminPromoCodes,
│   │                          # createPromotion/updatePromotion/deletePromotion, createPromoCode/updatePromoCode/deletePromoCode
│   ├── tasks.ts               # AdminTaskResponse, SaveTaskRequest, TASK_TYPE_LABELS, TASK_TYPE_WITH_TARGET,
│   │                          # TASK_TYPE_NEEDS_CATEGORY, getAdminTasks, createTask, updateTask, deleteTask
│   ├── auditLogs.ts           # AuditLogResponse, AUDIT_ENTITY_TYPES/ACTIONS/FIELD_NAMES maps, getAuditLogs(filters)
│   │                          # AUDIT_ENTITY_TYPES включає: Promotion, PromoCode, UserTask (+поля знижок/завдань)
│   └── notifications.ts       # AdminNotificationDto, NotificationTriggerConfigResponse (+emailSubject/emailMessage/
│                              # telegramMessage/systemTitle/systemMessage), UpdateNotificationTriggerConfigRequest,
│                              # NotificationAdminRecipientDto; getMyNotifications, getUnreadCount, markNotificationRead,
│                              # markAllNotificationsRead, getTriggerConfigs, updateTriggerConfig, getNotificationRecipients
├── stores/
│   ├── OrdersStore.ts     # MobX — orders list, pagination, status filter
│   ├── ProductsStore.ts   # MobX — products list, pagination, delete
│   ├── UsersStore.ts      # MobX — users list, pagination
│   ├── AuthStore.ts       # MobX — admin auth (JWT token + role info); getters: isSuperAdmin, allowedPages
│   ├── WarehouseStore.ts  # MobX — warehouse products, stats, categories, transactions
│   ├── DeliveryStore.ts   # MobX — deliveries, suppliers, delivery details Map, filters
│   ├── ChatStore.ts       # MobX singleton — SignalR connection; conversations[], messages Map<id,msgs[]>,
│   │                      # activeConversationId, isWidgetOpen, unreadCount (computed)
│   │                      # connect(token), disconnect(), loadConversations(), openConversation(id),
│   │                      # sendMessage(text), setWidgetOpen(open)
│   │                      # SignalR також слухає 'ReceiveAdminNotification' → notificationsStore.handlePush(n)
│   └── NotificationsStore.ts  # MobX singleton — unreadCount (observable), notifications[]
│                               # load(), handlePush(dto), markRead(id), markAllRead()
│                           # SignalR token passed via query string (?access_token=); groups: admins + conversation:{id}
├── components/
│   ├── RibbonEditorPreview.tsx  # SVG-превью стрічки (скопійовано з frontend)
│   │                            # Пропси: mainText, school, className, names, color, textColor,
│   │                            # extraTextColor, font, fontFamily?, emblemKey, emblems?: EmblemEntry[]
│   │                            # EmblemEntry = { sortOrder, svgUrlLeft, svgUrlRight }
│   │                            # EmblemFromUrl: auto-scale SVG via viewBox parsing + ref.current.innerHTML
│   ├── RibbonEditorPreview.css
│   ├── BadgeStaticPreview.tsx   # forwardRef canvas-компонент для статичного рендеру значка
│   │                            # Пропси: photoUrl, photoTransform, topText, bottomText, textColor, fontSize, fontFamily, size?
│   │                            # toDataUrl() через useImperativeHandle → offscreen canvas 358×358 (320 + 5mm padding * 2) з білим фоном
│   │                            # renderBadge(ctx, img, transform, ..., cx, cy, withWhiteBg) — shared функція для preview і download
│   │                            # crossOrigin='anonymous' для не-data URL (MinIO CORS)
│   ├── CertificatePreview.tsx   # forwardRef<HTMLCanvasElement, Props> canvas-компонент рендеру грамоти
│   │                            # Пропси: templateUrl, nativeOrientation, orientation, layout, title, bodyText,
│   │                            # organization, year, signerName, signerTitle, signer2Name?, signer2Title?,
│   │                            # additionalText?, fontFamily, previewName?, style?
│   │                            # Ротація фону: needsRotation = orientation !== nativeOrientation (той самий алгоритм що у frontend)
│   │                            # drawWithLayout: кожна зона кліпується через ctx.rect+clip до своїх меж
│   │                            # drawFallback: хардкод Y-позицій без шаблону (золота рамка)
│   │                            # crossOrigin='anonymous' для MinIO CORS; ref → canvas element для toDataURL()
│   ├── notifications/
│   │   └── NotificationsPopover.tsx  # Badge+Bell кнопка в header; Popover зі списком сповіщень
│   │                                  # Клік на сповіщення → navigate до /orders/:id або /users/:id
│   │                                  # "Позначити всі прочитаними" кнопка
│   ├── chat/
│   │   ├── ChatPanel.tsx    # Shared компонент: ліва панель (список розмов) + права (повідомлення + input)
│   │   │                    # Пропс: compact?: boolean (для floating widget)
│   │   │                    # Auto-scroll на нові повідомлення через useRef + useEffect
│   │   └── FloatingChat.tsx # Floating кнопка + overlay panel справа внизу
│   │                        # useLocation() → якщо pathname === '/chats' → return null (приховується)
│   │                        # Кнопка expand → setWidgetOpen(false) + navigate('/chats')
│   └── layout/
│       └── AdminLayout.tsx  # Sider з вкладеним меню + Header + Content (Outlet)
│                            # Меню фільтрується за role.pages (SuperAdmin бачить все)
│                            # Header показує тег ролі поруч з ім'ям адміна
│                            # useEffect → chatStore.connect(token) при монтуванні; cleanup disconnect()
│                            # Рендерить <FloatingChat /> перед закриваючим </Layout>
├── constants/
│   ├── ribbonRules.ts       # RibbonColor, Font, RIBBON_COLORS, FONTS, PRINT_TYPES, MATERIALS (без disabled логіки — правила в БД)
│   └── certificateLayout.ts # CANVAS_LANDSCAPE = {w:640,h:453}, CANVAS_PORTRAIT = {w:453,h:640}
└── pages/
    ├── dashboard/DashboardPage.tsx  # 9 блоків: Stats, Статуси+Recent, Distributions, Charts,
    │                                # TopItems+LowStock, Deliveries, Designs, TopProducts, SalesByCategory
    ├── orders/
    │   ├── OrdersPage.tsx         # Таблиця замовлень (ID + № колонки)
    │   └── OrderDetailPage.tsx
    ├── products/
    │   ├── ProductsPage.tsx       # Таблиця продуктів; кнопки: Шаблон / Експорт / Імпорт / Новий продукт
    │   │                          # Експорт: getAllProducts() → xlsx (всі сторінки); Імпорт: parse xlsx →
    │   │                          # якщо є ID → updateProduct, інакше → createProduct; категорію резолвить
    │   │                          # за Категорія ID або за назвою через getProductCategories()
    │   └── ProductEditPage.tsx
    ├── users/
    │   ├── UsersPage.tsx          # Таблиця з колонкою "Тип" (тег Гість/Зареєстрований)
    │   │                          # Зелена галочка (CheckCircleFilled) при verified email/name/phone
    │   │                          # Якщо hasGoogleId=true → замість галочки кольорова SVG іконка Google
    │   └── UserDetailPage.tsx     # Ліва колонка (xl=9): "Зв'язок з клієнтом" card
    │                              # Якщо hasGoogleId=true → тег "Google" (з SVG іконкою) поруч з типом акаунту
    │                              # (в заголовку і в рядку "Тип" info-картки)
    │                              #   Email: Drawer (тема + тіло → POST send-email)
    │                              #   SMS, Telegram бот, Viber бізнес-чат: disabled (Незабаром)
    │                              #   Viber: deep link viber://chat?number=+380...
    │                              #   Telegram: deep link https://t.me/+380...
    │                              # Права колонка (xl=15): Info card
    │                              #   EditableField: inline редагування name/phone (олівець → input)
    │                              #   VerificationTag: Dropdown для зміни isEmailVerified/isNameVerified/isPhoneVerified
    │                              # "Дизайни значків" Card: Promise.all([getUser, getBadgeDesignsByUser, getCertificateDesignsByUser])
    │                              #   badgeDesignColumns: перегляд (link → /designs/badge/:id), навігація до деталей
    │                              # "Дизайни грамот" Card: certDesignColumns → navigate /designs/certificate/:id
    │                              #   Показує designName, title, orientation; лічильник "Дизайнів" включає cert
    ├── designs/
    │   ├── SavedDesignsPage.tsx   # Tabs: Стрічки + Значки (BadgeStaticPreview canvas 80px) + Грамоти
    │   │                          # Вкладка Грамоти: клікабельні рядки → navigate /designs/certificate/:id
    │   ├── DesignDetailPage.tsx   # Превью стрічки, параметри, класи+імена, delete (Popconfirm)
    │   ├── BadgeDesignDetailPage.tsx  # Превью значка (BadgeStaticPreview), фото шаблону + download photo (blob fetch),
    │   │                              # download badge (offscreen canvas 358×358 з 5mm padding), параметри, user link
    │   └── CertificateDesignDetailPage.tsx  # Превью грамоти (CertificatePreview canvas), параметри, підписанти
    │                                        # "Завантажити фон" → blob fetch template.imageUrl → download PNG
    │                                        # "Завантажити дизайн" → canvasRef.current.toDataURL() → download PNG
    │                                        # Завантажує: getCertificateDesign → getCertificateTemplateById + getCertificateFonts
    ├── admins/
    │   ├── AdminsPage.tsx         # Таблиця з колонкою "Роль" (кольоровий тег); select ролі при створенні
    │   └── AdminDetailPage.tsx    # Inline role select (SuperAdmin: іконка олівця → borderless select)
    │                              # Password drawer (SuperAdmin → будь-хто; інші → тільки своя сторінка)
    ├── warehouse/
    │   └── WarehousePage.tsx    # Облік товарів: таблиця продуктів (ID колонка), статистика, прихід/видача
    │                             # Підтримка ?openId=X — відкриває ProductDetailModal для товару після завантаження
    ├── deliveries/
    │   ├── DeliveriesPage.tsx   # Таблиця поставок з фільтрами, прогрес-бар (ID колонка)
    │   ├── DeliveryDetailPage.tsx  # Деталі поставки: позиції, прийом товару, історія прийому (drawer)
    │   └── NewDeliveryPage.tsx  # Повна сторінка створення поставки (dynamic item rows)
    ├── chats/
    │   └── ChatsPage.tsx        # Full-page Telegram-like чат; header з іконкою
    │                             # margin: '0 -28px -24px' для ChatPanel (притискає до країв)
    ├── settings/
    │   ├── PromotionsPage.tsx       # Список акцій → navigate /settings/promotions/:id
    │   ├── PromotionEditPage.tsx    # Редактор: scope (Global/Category/Volume/Bundle), цільові категорії/підкатегорії,
    │   │                            # таблиця volume тирів, bundle items, дати, switches
    │   ├── PromoCodesPage.tsx       # Список промокодів; Code null → "тільки за завдання"
    │   ├── PromoCodeEditPage.tsx    # Редактор з live CardPreview; Code — optional (task-only promo codes)
    │   │                            # Preset кольори + ColorPicker; generate code кнопка
    │   ├── TasksPage.tsx            # Список завдань: тип (Tag), нагорода (кольор.крапка+назва), виконань
    │   └── TaskEditPage.tsx         # Редактор: taskType Select → умовний targetValue input (з одиницями),
    │                                # targetCategoryId для CategoryOrders, reward PromoCode Select (з кольоровим dot),
    │                                # DatePicker дедлайн, switches (isActive, isVisibleToGuests)
    ├── history/
    │   └── HistoryPage.tsx      # Таблиця audit-логів: фільтри (тип сутності multi-select + "Вибрати всі",
    │                             # адмін, дія, діапазон дат)
    │                             # Колонки: Коли / Адмін / Дія (тег) / Сутність (Link) / Зміни
    │                             # Create: collapse зі snapshot полів; Update: old→new по кожному полю
    │                             # ENTITY_ROUTE: Order/Product/User/Admin/Delivery → detail pages;
    │                             #   Role/Supplier/OrderStatus/Categories → ?openId=X;
    │                             #   ProductSubcategory → ?openSubcatId=X; DeliveryMethod → /settings/delivery/:id;
    │                             #   Warehouse/RibbonColors/Materials/PrintColors/Fonts/PrintTypes/Emblems → ?openId=X;
    │                             #   ConstructorIncompatibility/ForcedText → /rules?openId=X/?openForcedId=X
│                             #   Promotion → /settings/promotions/:id; PromoCode → /settings/promo-codes/:id
│                             #   UserTask → /settings/tasks/:id
    └── settings/
        ├── NotificationsPage.tsx  # Таблиця тригерів: new_order, order_status_changed (expandable з per-status дочірніми),
        │                          # new_user. Drawer: таби System/Email/Telegram + Divider перед шаблоном + MetadataTable
        │                          # System: картки адмінів + Select; Email: теги адрес; Telegram: теги user ID
        │                          # Recipients з /notification-triggers/recipients (Super Admin id=0 першим)
        │                          # ВАЖЛИВО: handleSave використовує form.getFieldsValue(true) — повертає значення
        │                          # незмонтованих Form.Item (вкладки Email/Telegram які не були відкриті)
        ├── CategoriesPage.tsx   # CRUD категорій товарів: ліва панель (категорії ID) + права (підкатегорії ID), drawer форми
        │                        # Підтримка ?openId=X (категорія) та ?openSubcatId=X (підкатегорія + auto-select parent)
        ├── DeliveryMethodsPage.tsx    # Таблиця методів (ID колонка), switch активності + кнопка редагувати
        ├── DeliveryMethodDetailPage.tsx  # Налаштування: isEnabled switch, Settings JSON, CheckoutFields editor (таблиця полів)
        ├── PaymentMethodsPage.tsx      # ID колонка; кнопка "Редагувати" → navigate /settings/payment/:id
        ├── OrderStatusesPage.tsx       # ID колонка; підтримка ?openId=X → відкриває drawer статусу
        ├── RolesPage.tsx        # CRUD ролей: таблиця (ID колонка), drawer з color picker (10 кольорів) + чекбокси сторінок
        │                        # Підтримка ?openId=X → відкриває drawer для ролі
        ├── SuppliersPage.tsx    # CRUD постачальників (ID колонка, drawer форма + popconfirm delete)
        │                        # Підтримка ?openId=X → відкриває drawer для постачальника
        ├── InfoPageEditPage.tsx # Редактор інформаційних сторінок (markdown textarea + save)
        └── constructor/
            ├── ColorsPage.tsx       # ID колонка; підтримка ?openId=X
            ├── MaterialsPage.tsx    # ID колонка; підтримка ?openId=X
            ├── PrintColorsPage.tsx  # ID колонка; підтримка ?openId=X
            ├── FontsPage.tsx        # ID колонка; підтримка ?openId=X
            ├── PrintTypesPage.tsx   # CRUD типів друку (ID колонка; підтримка ?openId=X)
            ├── EmblemsPage.tsx      # CRUD емблем + окремий SVG upload ліва/права (ID колонка; підтримка ?openId=X)
            │                        # Превью на білому фоні (56×56), upload тільки в drawer
            │                        # handleUpload(side, file) → uploadRibbonEmblemSvg(id, side, file)
            ├── RulesPage.tsx        # Scratch-подібний UI для правил конструктора
            │                        # Вкладка "Несумісності": блоки [поле][slug]→[недоступні|попередження][поле]: checkboxes
            │                        # Вкладка "Фіксований текст": блоки [поле][slug]→[targetField]: tag chips
            │                        # Slug-дропдауни завантажуються з API (printTypes, materials, fonts, printColors, colors, emblems)
            └── certificate/
                ├── CertificateTemplatesPage.tsx   # CRUD шаблонів грамот + upload PNG + кнопка "Налаштувати зони"
                │                                  # Колонка "Зони": зелений тег "Налаштовано" або сірий "Не задано"
                │                                  # navigate → /settings/constructor/certificates/templates/:id
                ├── CertificateTemplateEditPage.tsx # Редагування зон шаблону
                │                                   # Ліворуч: фіксований контейнер 640×500px; inner div з transform:scale(scale)
                │                                   # scale = min(640/canvasW, 500/canvasH) — не змінює розмір контейнера при перемиканні орієнтації
                │                                   # Перемикач орієнтації (Radio.Group альбомна/книжкова)
                │                                   # CertificateZoneEditor: інтерактивні зони + scale prop для коректних deltas
                │                                   # Праворуч: nativeOrientation, hasSecondSigner, hasAdditionalText + координати зон
                ├── CertificateZoneEditor.tsx       # Інтерактивний редактор зон (canvas фон + absolute div зони)
                │                                   # Props: imageUrl, nativeOrientation, viewOrientation, canvasW, canvasH, scale,
                │                                   #   layout, activeZones, selectedZone, onZoneSelect, onChange
                │                                   # ZONE_LABELS, ZONE_COLORS (10 зон)
                │                                   # DragState: {type: 'move'|'nw'|'ne'|'sw'|'se', key, startX, startY, startRect}
                │                                   # handleMouseMove: dx/dy ділиться на scale для коректних координат
                │                                   # Кутові handles 10×10, колір зони, label над рамкою
                ├── CertificatePaperTypesPage.tsx   # CRUD типів паперу
                └── CertificateFontsPage.tsx        # CRUD шрифтів грамот
```

## Маршрути (App.tsx)

```
/                   → DashboardPage
/chats              → ChatsPage
/orders             → OrdersPage
/orders/:id         → OrderDetailPage
/products           → ProductsPage
/products/:id       → ProductEditPage
/users              → UsersPage
/users/:id          → UserDetailPage
/designs                    → SavedDesignsPage
/designs/:id                → DesignDetailPage
/designs/badge/:id          → BadgeDesignDetailPage
/designs/certificate/:id    → CertificateDesignDetailPage
/admins             → AdminsPage
/admins/:id         → AdminDetailPage
/warehouse          → WarehousePage
/deliveries         → DeliveriesPage
/deliveries/new     → NewDeliveryPage
/deliveries/:id     → DeliveryDetailPage
/settings/promotions         → PromotionsPage
/settings/promotions/:id     → PromotionEditPage
/settings/promo-codes        → PromoCodesPage
/settings/promo-codes/:id    → PromoCodeEditPage
/settings/tasks              → TasksPage
/settings/tasks/:id          → TaskEditPage
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
/settings/notifications                              → NotificationsPage
/settings/constructor/certificates/templates         → CertificateTemplatesPage
/settings/constructor/certificates/templates/:id     → CertificateTemplateEditPage
/settings/constructor/certificates/paper-types       → CertificatePaperTypesPage
/settings/constructor/certificates/fonts             → CertificateFontsPage
```

## Меню (AdminLayout)

```
Дашборд
Замовлення
Продукти
Користувачі
Збережені дизайни
Адміни
Чати               (/chats)
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
    Грамоти ▶
      Шаблони        (/settings/constructor/certificates/templates)
      Типи паперу    (/settings/constructor/certificates/paper-types)
      Шрифти         (/settings/constructor/certificates/fonts)
  Сповіщення             (/settings/notifications)
  Знижки та завдання ▶   (підменю)
    Акції                (/settings/promotions)
    Промокоди            (/settings/promo-codes)
    Завдання             (/settings/tasks)
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
| PATCH  | /api/v1/admin/users/{id}/info                         | Оновити fullName/phone                   |
| PATCH  | /api/v1/admin/users/{id}/verification                 | Оновити isEmailVerified/isNameVerified/isPhoneVerified |
| POST   | /api/v1/admin/users/{id}/send-activation-email        | Надіслати лист активації → 204           |
| POST   | /api/v1/admin/users/{id}/send-email                   | Надіслати кастомний лист (subject, body) → 204 |
| GET    | /api/v1/admin/designs                                 | Всі збережені дизайни (paginated, з state) |
| GET    | /api/v1/admin/designs/{id}                            | Деталі дизайну (з state + classes)       |
| DELETE | /api/v1/admin/designs/{id}                            | Soft delete дизайну → 204               |
| GET    | /api/v1/admin/badge-designs                           | Всі дизайни значків (paginated)          |
| GET    | /api/v1/admin/badge-designs/{id}                      | Деталі дизайну значка                    |
| DELETE | /api/v1/admin/badge-designs/{id}                      | Soft delete → 204                        |
| GET    | /api/v1/admin/badge-designs/by-user/{userId}          | Дизайни значків конкретного юзера        |
| GET    | /api/v1/admin/certificate-designs                     | Всі дизайни грамот (paginated)           |
| GET    | /api/v1/admin/certificate-designs/{id}                | Деталі дизайну грамоти                   |
| DELETE | /api/v1/admin/certificate-designs/{id}                | Soft delete → 204                        |
| GET    | /api/v1/admin/certificate-designs/by-user/{userId}    | Дизайни грамот конкретного юзера         |
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

### Контент сторінок
| Метод  | Шлях | Опис |
|--------|------|------|
| GET    | /api/v1/page-content/{slug} | Публічний — JSON контент сторінки |
| GET    | /api/v1/admin/page-content/{slug} | Адмін — читати контент |
| PUT    | /api/v1/admin/page-content/{slug} | Адмін — зберегти контент (JSON body) |
| POST   | /api/v1/admin/page-content/{slug}/images?field={key} | Завантажити фото → { url } |

**Slugs:** `home`, `about`, `catalog`, `constructors`, `events`, `contacts`
**Seeder:** `PageContentSeeder` ініціалізує дефолтний контент при старті бекенду

### Акції та Промокоди
| Метод  | Шлях | Опис |
|--------|------|------|
| GET    | /api/v1/admin/promotions | Список акцій |
| GET    | /api/v1/admin/promotions/{id} | Деталі акції |
| POST   | /api/v1/admin/promotions | Створити |
| PUT    | /api/v1/admin/promotions/{id} | Оновити |
| DELETE | /api/v1/admin/promotions/{id} | Soft delete |
| GET    | /api/v1/admin/promo-codes | Список промокодів |
| POST   | /api/v1/admin/promo-codes | Створити (Code — optional, null для task-only) |
| PUT    | /api/v1/admin/promo-codes/{id} | Оновити |
| DELETE | /api/v1/admin/promo-codes/{id} | Soft delete |

### Завдання
| Метод  | Шлях | Опис |
|--------|------|------|
| GET    | /api/v1/admin/tasks | Список завдань |
| POST   | /api/v1/admin/tasks | Створити |
| PUT    | /api/v1/admin/tasks/{id} | Оновити |
| DELETE | /api/v1/admin/tasks/{id} | Soft delete |
| GET    | /api/v1/tasks | Публічний список (авторизований — з прогресом, фільтрує виконані) |

### Аудит-лог
| Метод  | Шлях | Опис |
|--------|------|------|
| GET    | /api/v1/admin/audit-logs | Журнал дій (?entityType, entityId, adminId, action, from, to, page, pageSize) |

**Трековані сутності (25):** Order, Product, User, Admin, Role, Delivery, Supplier, ProductCategory, ProductSubcategory, StockProduct, DeliveryMethod, PaymentMethod, OrderStatus, NotificationTriggerConfig, RibbonColor, RibbonMaterial, RibbonPrintColor, RibbonFont, RibbonPrintType, RibbonEmblem, ConstructorIncompatibility, ConstructorForcedText, Promotion, PromoCode, UserTask
**Дії:** Create (snapshot scalar полів), Update (old→new змінених полів), Delete (soft-delete через IsDeleted flag)
**adminId=null** → "Система" (seeder/background); **adminId=0** → Super Admin
**Виключені поля:** PasswordHash, IsDeleted, CreatedAt, UpdatedAt
**Constructor rule children**: ConstructorIncompatibilityTarget та ConstructorForcedTextValue мерджаться в parent-запис (SlugsB / Values: old→new) через `MergeChildChanges<T>` в AuditInterceptor
**NotificationTriggerConfig**: рядковий PK (TriggerType), entityId зберігається як 0 в audit logs

### Сповіщення адмінів
| Метод  | Шлях | Опис |
|--------|------|------|
| GET    | /api/v1/admin/notification-triggers | Конфіги тригерів |
| PUT    | /api/v1/admin/notification-triggers/{triggerType} | Оновити конфіг |
| GET    | /api/v1/admin/notification-triggers/recipients | Адміни + Super Admin (id=0) для вибору отримувачів |
| GET    | /api/v1/admin/notifications | Мої сповіщення (?limit=50) |
| GET    | /api/v1/admin/notifications/unread-count | Кількість непрочитаних |
| POST   | /api/v1/admin/notifications/{id}/read | Позначити прочитаним |
| POST   | /api/v1/admin/notifications/read-all | Позначити всі прочитаними |

### Чат (SignalR + REST)
| Метод  | Шлях                                            | Опис                                              |
|--------|-------------------------------------------------|---------------------------------------------------|
| GET    | /api/v1/admin/chats                             | Список розмов (ChatConversationListItem[])        |
| GET    | /api/v1/admin/chats/{id}/messages               | Повідомлення розмови (ChatMessageDto[])           |
| GET    | /api/v1/chat/my                                 | Розмова поточного юзера (GET або CREATE)          |
| GET    | /api/v1/chat/my/messages                        | Повідомлення поточного юзера                      |
| WS     | /hubs/chat?access_token=...                     | SignalR Hub (JWT via query string)                |

**SignalR Hub методи (клієнт → сервер):**
- `JoinConversation(conversationId)` — підписатись на групу `conversation:{id}`
- `SendMessage(conversationId, text)` — відправити повідомлення
- `MarkRead(conversationId)` — позначити прочитаними (тільки повідомлення від ІНШОЇ сторони)

**SignalR Hub події (сервер → клієнт):**
- `ReceiveMessage(ChatMessageDto)` — нове повідомлення в розмові
- `ConversationUpdated(ChatConversationListItem)` — оновлення розмови (для admin-групи)

**SignalR групи:**
- `admins` — всі підключені адміни (для `ConversationUpdated`)
- `conversation:{id}` — учасники конкретної розмови

### Конструктор — грамоти
| Метод  | Шлях                                                        | Опис                                          |
|--------|-------------------------------------------------------------|-----------------------------------------------|
| GET    | /api/v1/admin/certificate-templates                         | Список шаблонів                               |
| GET    | /api/v1/admin/certificate-templates/{id}                    | Деталі шаблону                                |
| POST   | /api/v1/admin/certificate-templates                         | Створити шаблон                               |
| PUT    | /api/v1/admin/certificate-templates/{id}                    | Оновити шаблон                                |
| DELETE | /api/v1/admin/certificate-templates/{id}                    | Soft delete                                   |
| POST   | /api/v1/admin/certificate-templates/{id}/image              | Upload PNG фону (multipart) → оновлений шаблон |
| PUT    | /api/v1/admin/certificate-templates/{id}/layout             | Зберегти конфіг зон (nativeOrientation, hasSecondSigner, hasAdditionalText, layoutJson) |
| GET    | /api/v1/admin/certificate-paper-types                       | Список типів паперу                           |
| POST   | /api/v1/admin/certificate-paper-types                       | Створити                                      |
| PUT    | /api/v1/admin/certificate-paper-types/{id}                  | Оновити                                       |
| DELETE | /api/v1/admin/certificate-paper-types/{id}                  | Soft delete                                   |
| GET    | /api/v1/admin/certificate-fonts                             | Список шрифтів                                |
| POST   | /api/v1/admin/certificate-fonts                             | Створити                                      |
| PUT    | /api/v1/admin/certificate-fonts/{id}                        | Оновити                                       |
| DELETE | /api/v1/admin/certificate-fonts/{id}                        | Soft delete                                   |

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
- `AdminSavedDesignItem` — id, designName, savedAt, userId, userFullName, userEmail?, **state: RibbonState**
- `AdminSavedDesignDetail` extends Item (повертається з GET /:id)
- `RibbonState.classes` зберігається як JSON-масив у полі `State` таблиці `SavedDesigns`
- Відображення: `RibbonEditorPreview` отримує `names` як `string[]` (flatMap по classes)
- `BadgeDesignState` — sizeId, photoUrl, photoTransform {scale,x,y,rotation}, topText, bottomText, textColorId, fontSlug, fontSize, comment
- `AdminSavedBadgeDesignItem` — id, designName, savedAt, userId, userFullName, userEmail?, state: BadgeDesignState
- `BadgeTextColorResponse` — id, name, hex, priceModifier
- `BadgeFontResponse` — id, name, slug, fontFamily
- `BadgeImageResponse` — id, name, imageUrl

**Certificate Constructor:**
- `CertificateZoneRect` — x, y, width, height
- `CertificateZoneKey` — 'title'|'name'|'bodyText'|'organization'|'year'|'signerName'|'signerTitle'|'signer2Name'|'signer2Title'|'additionalText'
- `CertificateOrientationLayout` — Record<CertificateZoneKey, CertificateZoneRect>
- `CertificateLayoutConfig` — { portrait: CertificateOrientationLayout, landscape: CertificateOrientationLayout }
- `CertificateTemplateResponse` — id, name, slug, imageUrl, priceModifier, isActive, sortOrder, nativeOrientation, hasSecondSigner, hasAdditionalText, layoutJson
- `SaveCertificateTemplateLayoutRequest` — nativeOrientation, hasSecondSigner, hasAdditionalText, layoutJson
- `CertificatePaperTypeResponse` — id, name, slug, priceModifier, isActive, sortOrder
- `CertificateFontResponse` — id, name, slug, fontFamily, priceModifier, isActive, sortOrder
- `CertificateDesignState` — templateId, paperTypeId, orientation, title, bodyText, organization, year, signerName, signerTitle, signer2Name, signer2Title, additionalText, fontId, comment
- `AdminCertificateDesignItem` — id, designName, savedAt, userId, userFullName, userEmail?, state: CertificateDesignState
- `layoutJson` зберігається в БД як JSON-рядок `{ portrait: {...zones}, landscape: {...zones} }`; парситься на клієнті через `JSON.parse` з fallback на дефолтні значення
- Дефолтні позиції зон задані в `CertificateTemplateEditPage` як `DEFAULT_LANDSCAPE` / `DEFAULT_PORTRAIT` константи

**Users (гостьові користувачі + верифікація):**
- `AdminUser` — id, isGuest, email: string | null, fullName, phone?, createdAt, ordersCount, **isEmailVerified, isNameVerified, isPhoneVerified**, **hasGoogleId**
- `AdminUserDetail` — + orders[], savedDesigns[], + всі verification поля, **hasGoogleId**
- `PatchUserInfoRequest` — fullName?, phone?
- `PatchUserVerificationRequest` — isEmailVerified?, isNameVerified?, isPhoneVerified?
- `SendUserEmailRequest` — subject, body
- Гостьовий юзер: `isGuest=true`, `email=null`, `passwordHash=null` — створюється автоматично при замовленні без акаунту
- Merge при реєстрації: якщо `phone` збігається з гостем → UPDATE того самого рядка (IsGuest=false, Email, PasswordHash)
- `FindOrCreateGuestUserAsync(phone, fullName)` — логіка в `OrderService`: знаходить або створює гостя за телефоном
- Унікальний індекс на `Phone` (partial: `WHERE Phone IS NOT NULL`) — гарантує один запис на номер

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

**Chat (онлайн чат):**
- `ChatSenderType` enum — `User | Admin` (зберігається як int в БД)
- `ChatMessageDto` — id, conversationId, senderType ('User'|'Admin'), senderId, text, sentAt, isRead
- `ChatConversationListItem` — id, userId, userFullName, userEmail?, lastMessageText?, lastMessageAt?, unreadCount
- `ChatConversation` entity — UserId FK, LastMessageAt, IsClosedByAdmin, Messages[]
- `ChatMessage` entity — ConversationId FK, SenderId, SenderType, Text, SentAt, IsRead
- `MarkMessagesReadAsync(conversationId, readBy)` — позначає як прочитані тільки повідомлення від ІНШОГО sender-а

## Особливості реалізації

**Система сповіщень адмінів:**
- SignalR подія `ReceiveAdminNotification` приходить у групу `admin:{id}` (Super Admin — `admin:0`)
- `ChatStore.connect()` реєструє обробник → `notificationsStore.handlePush(dto)`
- `NotificationsStore` зберігає `unreadCount` + список; `load()` запитує REST при вході
- `NotificationsPopover` рендериться в header поруч з іменем адміна; Badge показує unreadCount
- Тригери: `new_order`, `order_status_changed`, `order_status_changed:{statusName}` (sub-тригери), `new_user`
- Шаблони `{{variable}}` підставляються на бекенді; доступні змінні відображаються в MetadataTable у drawer
- Super Admin (id=0): тільки real-time push через SignalR, без запису в БД (немає рядка в таблиці Admins)
- Email відправляється через `SendRawEmailAsync` якщо `EmailEnabled=true`; Telegram — конфіг є, відправки немає

**URL-based drawer opening (`?openId=X`):**
- Всі сторінки з drawer-редагуванням підтримують URL-параметр `?openId=X` — після завантаження даних автоматично відкривається drawer для запису з відповідним ID
- Паттерн: `const initialOpenId = useRef(searchParams.get('openId'))` → після fetch знаходить item за ID, викликає `openEdit(item)`, очищає ref та URL (`setSearchParams({}, { replace: true })`)
- CategoriesPage: також `?openSubcatId=X` — знаходить батьківську категорію, встановлює `selectedCategory`, відкриває sub-drawer
- HistoryPage використовує `Link` (React Router) а не `<a href>` для навігації до сутностей
- Всі таблиці мають колонку `ID` (width: 70px) як першу колонку

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

**CertificateZoneEditor — масштабування дошки:**
- Зовнішній контейнер фіксований 640×500px — не змінює розмір при перемиканні орієнтації
- Внутрішній div з `transform: scale(scale); transformOrigin: top left` де `scale = min(640/canvasW, 500/canvasH)`
- Альбомна (640×453): scale≈1; Книжкова (453×640): scale≈0.78
- `CertificateZoneEditor` приймає `scale` prop; `handleMouseMove` ділить `dx/dy` на `scale` для коректних координат зон

**CertificatePreview canvas — рендер тексту:**
- Кожна текстова зона використовує `ctx.save(); ctx.beginPath(); ctx.rect(zone.x, zone.y, zone.width, zone.height); ctx.clip()` перед fillText — текст не виходить за межі зони
- Декоративні лінії (підкреслення заголовку, лінії підписантів) малюються в окремих save/restore блоках БЕЗ кліпування (вони навмисно виходять за межу зони)
- Той самий алгоритм ротації фону що у `CertificateEditorPreview` на frontend

**ChatPanel + FloatingChat (чат):**
- `ChatPanel` — shared компонент; ліва панель = список розмов (Avatar + ім'я + preview + unread badge); права панель = повідомлення + textarea input
- `FloatingChat` — `useLocation()` → `if (pathname === '/chats') return null`; overlay 520px wide; кнопка expand → `navigate('/chats')`; singleton `chatStore` використовується одночасно ChatsPage і FloatingChat
- `ChatsPage` — `margin: '0 -28px -24px'` для ChatPanel щоб притиснути до країв сторінки
- `chatStore.connect(token)` викликається в `AdminLayout` `useEffect` при монтуванні; `chatStore.unreadCount` — computed (sum unread по conversations)

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

**ВАЖЛИВО: порядок деплою бекенду** — завжди спочатку rebuild image локально і push на Docker Hub, потім pull на сервері. `docker compose pull` тягне з Docker Hub — якщо не запушив, сервер підніме стару версію.

## Nginx — WebSocket для SignalR

SignalR потребує спеціального блоку в nginx.conf для `/hubs/` шляху:

```nginx
location /hubs/ {
    proxy_pass http://api:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Без цього блоку WebSocket handshake падає і SignalR не може підключитись. Конфіг редагується вручну на сервері (`/etc/nginx/sites-available/...` або в `docker-compose` volumes).

## Бекенд — важливі патерни

- **Global query filters** (`!e.IsDeleted`) на: User, Order, OrderItem, SavedDesign, CartItem, Product, Admin, **Supplier, Delivery**. При Include навігації з query filter — обов'язково завантажувати через окремий запит з `IgnoreQueryFilters()` щоб уникнути null.
- **apiFetch** — перевіряє `res.status === 204` перед `res.json()`. Ендпоінти що повертають "порожній успіх" мусять повертати 204, не 200.
- **Гостьові юзери** — `User.Email` і `User.PasswordHash` є nullable. Гості не можуть логінитись (`LoginAsync` фільтрує `!u.IsGuest`). При реєстрації з тим самим телефоном — UPDATE існуючого рядка, а не INSERT нового.
- **SignalR JWT** — токен передається через query string `?access_token=` (не Authorization header). В `Program.cs` потрібен `JwtBearerEvents.OnMessageReceived` для читання з `context.Request.Query["access_token"]`.
- **ChatHub авторизація** — `IsAdmin()` перевіряє `Context.User.IsInRole("Admin")`; admin JWT має role claim "Admin", user JWT — ні.
- **Idempotent migrations** — для production де міграції могли частково застосуватись: використовувати `IF EXISTS`/`IF NOT EXISTS`/`ON CONFLICT DO NOTHING` замість EF Core `DropIndex`/`CreateTable`/`InsertData`.

## Клієнтський фронт (vypusknyk-plus-frontend) — Chat

- `src/stores/ChatStore.ts` — клас (не singleton), доданий до `RootStore`; `connect()` бере токен через `getToken()` з `src/api/token.ts`; `open()` → `unreadCount=0` + invoke MarkRead
- `src/components/chat/ChatWidget.tsx` — `observer()`; рендерить null якщо `!auth.isLoggedIn`; connects через `useEffect([auth.isLoggedIn])`; рожевий gradient кнопка 52×52 bottom-right; overlay 340×480px; unread badge
- `@microsoft/signalr` — npm пакет встановлений в обох проектах (admin + frontend)

## TODO

- [ ] Наповнити сторінки налаштувань (доставка, оплата, статуси, кольори)
