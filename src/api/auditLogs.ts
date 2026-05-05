import { apiFetch } from './client';

export interface AuditLogResponse {
  id: number;
  adminId: number | null;
  adminName: string;
  entityType: string;
  entityId: number;
  action: string;
  changesJson: string | null;
  createdAt: string;
}

export interface AuditLogsPagedResponse {
  items: AuditLogResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogFilters {
  entityTypes?: string[];
  entityId?: number;
  adminId?: number;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const AUDIT_ENTITY_TYPES: Record<string, string> = {
  Order: 'Замовлення',
  Product: 'Продукт',
  User: 'Користувач',
  Admin: 'Адмін',
  Role: 'Роль',
  Delivery: 'Поставка',
  Supplier: 'Постачальник',
  ProductCategory: 'Категорія',
  ProductSubcategory: 'Підкатегорія',
  StockProduct: 'Складський товар',
  DeliveryMethod: 'Метод доставки',
  PaymentMethod: 'Метод оплати',
  OrderStatus: 'Статус замовлення',
  NotificationTriggerConfig: 'Сповіщення',
  RibbonColor: 'Колір стрічки',
  RibbonMaterial: 'Матеріал',
  RibbonPrintColor: 'Колір друку',
  RibbonFont: 'Шрифт',
  RibbonPrintType: 'Тип друку',
  RibbonEmblem: 'Емблема',
  ConstructorIncompatibility: 'Несумісність',
  ConstructorForcedText: 'Фіксований текст',
  Promotion: 'Акція',
  PromoCode: 'Промокод',
  UserTask: 'Завдання',
};

export const AUDIT_ACTIONS: Record<string, string> = {
  Create: 'Створення',
  Update: 'Оновлення',
  Delete: 'Видалення',
};

export const AUDIT_FIELD_NAMES: Record<string, string> = {
  Name: 'Назва',
  Price: 'Ціна',
  Description: 'Опис',
  StatusId: 'Статус',
  IsActive: 'Активний',
  SortOrder: 'Порядок',
  Slug: 'Slug',
  PriceModifier: 'Модифікатор ціни',
  FullName: "Повне ім'я",
  Phone: 'Телефон',
  Email: 'Email',
  IsEmailVerified: 'Email верифіковано',
  IsNameVerified: "Ім'я верифіковано",
  IsPhoneVerified: 'Телефон верифіковано',
  RoleId: 'Роль',
  Color: 'Колір',
  IsEnabled: 'Увімкнено',
  ContactPerson: 'Контактна особа',
  Address: 'Адреса',
  TaxId: 'ЄДРПОУ',
  ExpectedDate: 'Очікувана дата',
  SupplierId: 'Постачальник',
  Pages: 'Сторінки',
  IsSuperAdmin: 'Супер адмін',
  CategoryId: 'Категорія',
  SubcategoryId: 'Підкатегорія',
  Order: 'Порядок',
  DiscountType: 'Тип знижки',
  DiscountValue: 'Розмір знижки',
  MinOrderAmount: 'Мін. сума замовлення',
  MaxUsages: 'Ліміт використань',
  IsOneTimePerUser: 'Один раз на юзера',
  Scope: 'Тип акції',
  Code: 'Код',
  CardColor: 'Колір картки',
  DisplayName: 'Назва картки',
  TaskType: 'Тип завдання',
  TargetValue: 'Цільове значення',
  TargetCategoryId: 'Категорія',
  RewardPromoCodeId: 'Нагорода (промокод)',
  IsVisibleToGuests: 'Видно гостям',
  EndsAt: 'Дедлайн',
};

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogsPagedResponse> {
  const params = new URLSearchParams();
  filters.entityTypes?.forEach(t => params.append('entityTypes', t));
  if (filters.entityId != null) params.set('entityId', String(filters.entityId));
  if (filters.adminId != null) params.set('adminId', String(filters.adminId));
  if (filters.action) params.set('action', filters.action);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.page != null) params.set('page', String(filters.page));
  if (filters.pageSize != null) params.set('pageSize', String(filters.pageSize));
  return apiFetch(`/api/v1/admin/audit-logs?${params.toString()}`);
}
