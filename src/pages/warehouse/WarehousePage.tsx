import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Table, Button, Tag, Select, Input, Card, Row, Col, Modal, Tabs,
  Drawer, Form, InputNumber, DatePicker, Statistic, Space, Badge, Spin, Checkbox,
} from 'antd'
import {
  InboxOutlined, PlusOutlined, MinusOutlined, SearchOutlined,
  BarChartOutlined, WarningOutlined, StopOutlined, AppstoreOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { warehouseStore } from '../../stores/WarehouseStore'
import type {
  StockProductSummary, StockMaterial, StockTransactionResponse,
} from '../../api/types'

// ─── Static data ─────────────────────────────────────────────────────────────

const MATERIAL_LABELS: Record<StockMaterial, string> = {
  Atlas: 'Атлас', Satin: 'Сатин', Silk: 'Шовк',
}

const COLORS_BY_MATERIAL: Record<StockMaterial, string[]> = {
  Atlas: [
    'Білий', 'Синій', 'Червоний', 'Золотий', 'Жовто-блакитний', 'Фіолетовий',
    'Срібний', 'Малиновий', 'Бузковий', 'Рожевий', 'Салатовий', 'Помаранчевий',
    'Айворі', 'Жовтий', 'Корал', "М'ята", 'Пудра', 'Персик', 'Блакитний',
    'Смарагд', 'світло-Бордо',
  ],
  Satin: [
    'Білий', 'Айворі', 'Синій', 'Блакитний', 'Жовтий', 'св.бежевий',
    'т.бежевий', 'Пісочний', 'Срібний', 'Малиновий', 'тем.Бордо',
    'кремовий', 'Персик', 'Смарагд', 'Помаранчевий', 'Лавандовий',
  ],
  Silk: [
    'Білий', 'Синій', 'Бордо', 'Червоний', 'Жовто-блакитний', 'Фіолетовий',
    'Рожевий', 'Салатовий', 'Зелений', 'Голубий',
  ],
}

const ALL_COLORS = [...new Set(Object.values(COLORS_BY_MATERIAL).flat())]

const COLOR_HEX: Record<string, string> = {
  'Білий': '#F8F8F8', 'Синій': '#1D4ED8', 'Червоний': '#DC2626',
  'Золотий': '#D97706', 'Жовто-блакитний': '#FCD34D', 'Фіолетовий': '#7C3AED',
  'Срібний': '#9CA3AF', 'Малиновий': '#BE185D', 'Бузковий': '#A855F7',
  'Рожевий': '#EC4899', 'Салатовий': '#84CC16', 'Помаранчевий': '#F97316',
  'Айворі': '#FFFDD0', 'Жовтий': '#EAB308', 'Корал': '#FF6B6B',
  "М'ята": '#6EE7B7', 'Пудра': '#FBCFE8', 'Персик': '#FDBA74',
  'Блакитний': '#7DD3FC', 'Смарагд': '#059669', 'світло-Бордо': '#C0324A',
  'Бордо': '#881337', 'св.бежевий': '#F5E6CA', 'т.бежевий': '#C9A96E',
  'Пісочний': '#D4B483', 'тем.Бордо': '#6B1E35', 'кремовий': '#FFFACD',
  'Лавандовий': '#E6E6FA', 'Зелений': '#16A34A', 'Голубий': '#38BDF8',
}

const STATUS_CONFIG = {
  in_stock: { label: 'В наявності', color: 'green' },
  low_stock: { label: 'Мало', color: 'gold' },
  out_of_stock: { label: 'Немає', color: 'red' },
}

const MATERIALS: StockMaterial[] = ['Atlas', 'Satin', 'Silk']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ColorDot({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: COLOR_HEX[color] ?? '#E5E7EB',
      border: '1px solid #D1D5DB', marginRight: 6, verticalAlign: 'middle', flexShrink: 0,
    }} />
  )
}

function colorOption(c: string) {
  return { value: c, label: <span style={{ display: 'flex', alignItems: 'center' }}><ColorDot color={c} />{c}</span> }
}

// ─── Expanded transactions ────────────────────────────────────────────────────

const ExpandedTransactions = observer(({ productId }: { productId: number }) => {
  const detail = warehouseStore.productDetails.get(productId)
  const product = warehouseStore.products.find(p => p.id === productId)
  const isLoading = warehouseStore.productDetailsLoading.has(productId)
  const [colorFilter, setColorFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  if (isLoading) return <div style={{ padding: 16, textAlign: 'center' }}><Spin size="small" /></div>
  if (!detail) return null

  const hasColor = product?.hasColor ?? detail.hasColor
  const hasMaterial = product?.hasMaterial ?? detail.hasMaterial

  const transactions = detail.transactions.filter(t => {
    if (colorFilter && t.color !== colorFilter) return false
    if (materialFilter && t.material !== materialFilter) return false
    return true
  })

  const availableColors = hasColor ? [...new Set(detail.transactions.map(t => t.color).filter(Boolean))] : []
  const availableMaterials = hasMaterial ? [...new Set(detail.transactions.map(t => t.material).filter(Boolean))] as StockMaterial[] : []

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {hasColor && (
          <Select
            value={colorFilter || undefined} placeholder="Всі кольори" allowClear size="small"
            style={{ width: 160 }} onChange={v => setColorFilter(v ?? '')}
            options={availableColors.map(colorOption)}
          />
        )}
        {hasMaterial && (
          <Select
            value={materialFilter || undefined} placeholder="Всі матеріали" allowClear size="small"
            style={{ width: 130 }} onChange={v => setMaterialFilter(v ?? '')}
            options={availableMaterials.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
          />
        )}
        <span style={{ color: '#9CA3AF', fontSize: 12, lineHeight: '24px' }}>
          {transactions.length} записів
        </span>
      </div>
      <div style={{ height: 280, overflowY: 'auto', border: '1px solid #F3F4F6', borderRadius: 6 }}>
        {transactions.length === 0
          ? <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Немає транзакцій</div>
          : transactions.map(t => <TransactionListItem key={t.id} t={t} hasColor={hasColor} hasMaterial={hasMaterial} />)
        }
      </div>
    </div>
  )
})

function TransactionListItem({ t, hasColor, hasMaterial }: {
  t: StockTransactionResponse; hasColor?: boolean; hasMaterial?: boolean
}) {
  const isIncome = t.type === 'income'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: '1px solid #F9FAFB' }}>
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 }}>{isIncome ? '📦' : '📤'}</span>
      <span style={{ width: 88, color: '#6B7280', fontSize: 12, flexShrink: 0 }}>{t.date}</span>
      {hasMaterial !== false && (
        <span style={{ width: 52, fontSize: 11, color: '#9CA3AF', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {MATERIAL_LABELS[t.material as StockMaterial] ?? t.material}
        </span>
      )}
      {hasColor !== false && (
        <span style={{ width: 130, display: 'flex', alignItems: 'center', flexShrink: 0, overflow: 'hidden' }}>
          <ColorDot color={t.color} />
          <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.color}</span>
        </span>
      )}
      <span style={{ width: 52, fontWeight: 700, fontSize: 13, flexShrink: 0, color: isIncome ? '#16A34A' : '#DC2626' }}>
        {isIncome ? '+' : '-'}{t.quantity}
      </span>
      <span style={{ flex: 1, color: '#6B7280', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {t.note}
      </span>
    </div>
  )
}

// ─── Product detail modal ─────────────────────────────────────────────────────

const ProductDetailModal = observer(({
  productId, open, onClose, onIncome, onOutcome,
}: {
  productId: number | null; open: boolean; onClose: () => void
  onIncome: () => void; onOutcome: () => void
}) => {
  const detail = productId ? warehouseStore.productDetails.get(productId) : null
  const isLoading = productId ? warehouseStore.productDetailsLoading.has(productId) : false
  const variants = detail?.variants ?? []
  const hasColor = detail?.hasColor ?? true
  const hasMaterial = detail?.hasMaterial ?? true
  const allColors = hasColor ? [...new Set(variants.map(v => v.color).filter(Boolean))] : []
  const allMaterials = hasMaterial ? MATERIALS.filter(m => variants.some(v => v.material === m)) : []
  const stockMap = new Map(variants.map(v => [`${v.material}:${v.color}`, v.currentStock]))

  return (
    <Modal open={open} onCancel={onClose} width={820}
      title={
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{detail?.name ?? '...'}</div>
          <div style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 400 }}>
            {detail?.categoryName} / {detail?.subcategoryName}
          </div>
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button icon={<PlusOutlined />} type="primary" onClick={onIncome}>Додати прихід</Button>
          <Button icon={<MinusOutlined />} danger onClick={onOutcome}>Зареєструвати видачу</Button>
        </div>
      }
      loading={isLoading}
    >
      <Tabs items={[
        {
          key: 'stock', label: 'Залишки',
          children: variants.length === 0
            ? <p style={{ color: '#9CA3AF' }}>Немає надходжень</p>
            : !hasColor && !hasMaterial
              ? (
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', padding: '16px 0' }}>
                  {variants[0]?.currentStock ?? 0} шт
                </div>
              )
              : !hasColor && hasMaterial
                ? (
                  <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>Матеріал</th>
                        <th style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>Кількість</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMaterials.map(m => {
                        const qty = stockMap.get(`${m}:`) ?? 0
                        return (
                          <tr key={m} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '8px 12px' }}>{MATERIAL_LABELS[m]}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: qty === 0 ? '#D1D5DB' : qty < 10 ? '#EF4444' : '#111827' }}>
                              {qty > 0 ? qty : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
                : hasColor && !hasMaterial
                  ? (
                    <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>Колір</th>
                          <th style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>Кількість</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allColors.map(color => {
                          const qty = stockMap.get(`:${color}`) ?? 0
                          return (
                            <tr key={color} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}><ColorDot color={color} />{color}</span>
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: qty === 0 ? '#D1D5DB' : qty < 10 ? '#EF4444' : '#111827' }}>
                                {qty > 0 ? qty : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )
                  : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>Колір</th>
                            {allMaterials.map(m => (
                              <th key={m} style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                                {MATERIAL_LABELS[m]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {allColors.map(color => (
                            <tr key={color} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}><ColorDot color={color} />{color}</span>
                              </td>
                              {allMaterials.map(m => {
                                const qty = stockMap.get(`${m}:${color}`) ?? 0
                                return (
                                  <td key={m} style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: qty === 0 ? '#D1D5DB' : qty < 10 ? '#EF4444' : '#111827' }}>
                                    {qty > 0 ? qty : '—'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ),
        },
        {
          key: 'history', label: `Історія (${detail?.transactions.length ?? 0})`,
          children: (
            <div style={{ height: 380, overflowY: 'auto' }}>
              {(detail?.transactions ?? []).length === 0
                ? <p style={{ color: '#9CA3AF' }}>Немає транзакцій</p>
                : (detail?.transactions ?? []).map(t =>
                    <TransactionListItem key={t.id} t={t} hasColor={hasColor} hasMaterial={hasMaterial} />)
              }
            </div>
          ),
        },
      ]} />
    </Modal>
  )
})

// ─── Transaction drawer ───────────────────────────────────────────────────────

function TransactionDrawer({
  open, type, productId, presetMaterial, presetColor, onClose, onSuccess,
}: {
  open: boolean; type: 'income' | 'outcome'; productId: number | null
  presetMaterial?: StockMaterial; presetColor?: string
  onClose: () => void; onSuccess: () => void
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const selectedProduct = productId
    ? warehouseStore.products.find(p => p.id === productId)
    : null

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        productId: productId ?? undefined,
        material: presetMaterial ?? undefined,
        color: presetColor ?? undefined,
        date: dayjs(),
      })
    }
  }, [open, productId, presetMaterial, presetColor, form])

  const watchProductId = Form.useWatch('productId', form) as number | undefined
  const watchMaterial = Form.useWatch('material', form) as StockMaterial | undefined
  const watchColor = Form.useWatch('color', form) as string | undefined

  const activeProduct = watchProductId
    ? warehouseStore.products.find(p => p.id === watchProductId)
    : selectedProduct

  const currentVariant = watchProductId
    ? warehouseStore.productDetails.get(watchProductId)?.variants.find(v => {
        const matOk = !activeProduct?.hasMaterial || v.material === watchMaterial
        const colOk = !activeProduct?.hasColor || v.color === watchColor
        return matOk && colOk
      })
    : undefined
  const maxQty = type === 'outcome' ? (currentVariant?.currentStock ?? 0) : undefined

  const { products, categories, allSubcategories } = warehouseStore
  const productOptions = categories
    .map(cat => ({
      label: cat.name,
      options: allSubcategories
        .filter(s => s.categoryId === cat.id)
        .flatMap(sub =>
          products
            .filter(p => p.subcategoryId === sub.id)
            .map(p => ({ label: `${p.name} (${sub.name})`, value: p.id }))
        ),
    }))
    .filter(g => g.options.length > 0)

  const colorOptions = activeProduct?.hasColor
    ? activeProduct.hasMaterial
      ? (watchMaterial ? COLORS_BY_MATERIAL[watchMaterial].map(colorOption) : [])
      : ALL_COLORS.map(colorOption)
    : []

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setLoading(true)
    try {
      await warehouseStore.addTransaction({
        productId: values.productId,
        material: values.material ?? '',
        color: values.color ?? '',
        type,
        quantity: values.quantity,
        date: (values.date as dayjs.Dayjs).format('YYYY-MM-DD'),
        note: values.note ?? '',
      })
      form.resetFields()
      onSuccess()
    } catch (e) {
      form.setFields([{ name: 'quantity', errors: [e instanceof Error ? e.message : 'Помилка'] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} width={480}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {type === 'income'
            ? <><PlusOutlined style={{ color: '#16A34A' }} /><span>Додати прихід</span></>
            : <><MinusOutlined style={{ color: '#DC2626' }} /><span>Зареєструвати видачу</span></>}
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Скасувати</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}
            style={type === 'outcome' ? { background: '#DC2626', borderColor: '#DC2626' } : {}}>
            {type === 'income' ? 'Зберегти прихід' : 'Зберегти видачу'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="productId" label="Товар" rules={[{ required: true, message: 'Оберіть товар' }]}>
          <Select showSearch optionFilterProp="label" options={productOptions} placeholder="Оберіть товар..."
            onChange={() => { form.setFieldValue('material', undefined); form.setFieldValue('color', undefined) }}
          />
        </Form.Item>
        {activeProduct?.hasMaterial !== false && (
          <Form.Item name="material" label="Матеріал" rules={[{ required: true, message: 'Оберіть матеріал' }]}>
            <Select
              options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
              placeholder="Атлас / Сатин / Шовк"
              onChange={() => form.setFieldValue('color', undefined)}
            />
          </Form.Item>
        )}
        {activeProduct?.hasColor !== false && (
          <Form.Item name="color" label="Колір" rules={[{ required: true, message: 'Оберіть колір' }]}>
            <Select showSearch options={colorOptions}
              placeholder={activeProduct?.hasMaterial !== false && !watchMaterial ? 'Спочатку оберіть матеріал' : 'Оберіть колір...'}
              disabled={activeProduct?.hasMaterial !== false && !watchMaterial}
            />
          </Form.Item>
        )}
        <Form.Item
          name="quantity"
          label={type === 'outcome' && maxQty !== undefined ? `Кількість (є на складі: ${maxQty})` : 'Кількість'}
          rules={[
            { required: true, message: 'Вкажіть кількість' },
            { type: 'number', min: 1, message: 'Мінімум 1' },
            ...(type === 'outcome' && maxQty !== undefined
              ? [{ type: 'number' as const, max: maxQty, message: `Максимум ${maxQty}` }] : []),
          ]}
        >
          <InputNumber min={1} max={maxQty} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
        </Form.Item>
        <Form.Item name="note" label={type === 'income' ? 'Примітка' : 'Кому / замовлення'}>
          <Input placeholder={type === 'income' ? "Необов'язково..." : 'Наприклад: школа №5, Одеса'} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

// ─── Create product drawer ────────────────────────────────────────────────────

const CreateProductDrawer = observer(({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  useEffect(() => {
    if (!open) { form.resetFields(); setSelectedCategoryId(null) }
  }, [open, form])

  const subcategoryOptions = warehouseStore.allSubcategories
    .filter(s => !selectedCategoryId || s.categoryId === selectedCategoryId)
    .map(s => ({ value: s.id, label: s.name }))

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setLoading(true)
    try {
      await warehouseStore.createProduct({
        subcategoryId: values.subcategoryId,
        name: values.name,
        description: values.description,
        hasColor: values.hasColor ?? false,
        hasMaterial: values.hasMaterial ?? false,
      })
      form.resetFields()
      setSelectedCategoryId(null)
      onClose()
    } catch (e) {
      form.setFields([{ name: 'name', errors: [e instanceof Error ? e.message : 'Помилка'] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onClose={onClose} width={440}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PlusOutlined /><span>Створити товар</span></div>}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Скасувати</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>Створити</Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ hasColor: false, hasMaterial: false }}>
        <Form.Item name="name" label="Назва товару" rules={[{ required: true, message: "Введіть назву" }]}>
          <Input placeholder="Наприклад: Дзвоник великий синій" />
        </Form.Item>
        <Form.Item name="categoryId" label="Категорія" rules={[{ required: true, message: 'Оберіть категорію' }]}>
          <Select
            placeholder="Оберіть категорію..."
            allowClear
            options={warehouseStore.categories.map(c => ({ value: c.id, label: c.name }))}
            onChange={(v: number | undefined) => {
              setSelectedCategoryId(v ?? null)
              form.setFieldValue('subcategoryId', undefined)
            }}
          />
        </Form.Item>
        <Form.Item name="subcategoryId" label="Підкатегорія" rules={[{ required: true, message: 'Оберіть підкатегорію' }]}>
          <Select
            placeholder="Оберіть підкатегорію..."
            options={subcategoryOptions}
            disabled={subcategoryOptions.length === 0}
          />
        </Form.Item>
        <Form.Item name="hasColor" valuePropName="checked">
          <Checkbox>Параметр кольору (стрічка має колір)</Checkbox>
        </Form.Item>
        <Form.Item name="hasMaterial" valuePropName="checked">
          <Checkbox>Параметр матеріалу (атлас / сатин / шовк)</Checkbox>
        </Form.Item>
        <Form.Item name="description" label="Опис (необов'язково)">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Drawer>
  )
})

// ─── Main page ────────────────────────────────────────────────────────────────

const WarehousePage = observer(() => {
  const store = warehouseStore

  const [detailOpen, setDetailOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState<number | null>(null)
  const [presetMaterial, setPresetMaterial] = useState<StockMaterial | undefined>()
  const [presetColor, setPresetColor] = useState<string | undefined>()

  useEffect(() => {
    store.fetchStats()
    store.fetchCategories()
    store.fetchProducts()
  }, [])

  const openIncome = (id: number, material?: StockMaterial, color?: string) => {
    setActiveProductId(id); setPresetMaterial(material); setPresetColor(color); setIncomeOpen(true)
  }
  const openOutcome = (id: number, material?: StockMaterial, color?: string) => {
    setActiveProductId(id); setPresetMaterial(material); setPresetColor(color); setOutcomeOpen(true)
  }
  const openDetail = (id: number) => {
    setActiveProductId(id)
    store.modalProductId = id
    setDetailOpen(true)
    if (!store.productDetails.has(id)) store.fetchProductDetail(id)
  }

  const columns = [
    {
      title: 'Назва', dataIndex: 'name', key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Категорія', dataIndex: 'categoryName', key: 'categoryName',
      render: (v: string) => <span style={{ color: '#6B7280', fontSize: 13 }}>{v}</span>,
    },
    {
      title: 'Підкатегорія', dataIndex: 'subcategoryName', key: 'subcategoryName',
      render: (v: string) => <span style={{ color: '#9CA3AF', fontSize: 12 }}>{v}</span>,
    },
    {
      title: 'На складі', dataIndex: 'totalStock', key: 'totalStock', width: 100,
      render: (v: number) => <strong>{v} шт</strong>,
    },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? { label: s, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Дії', key: 'actions', width: 160,
      render: (_: unknown, r: StockProductSummary) => (
        <Space onClick={e => e.stopPropagation()}>
          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => openIncome(r.id)}>Прихід</Button>
          <Button size="small" danger icon={<MinusOutlined />} onClick={() => openOutcome(r.id)}>Видача</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #0891b2 0%, #0f766e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <InboxOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Облік товарів</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Залишки товарів на складі</p>
          </div>
        </div>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Створити товар</Button>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setActiveProductId(null); setPresetMaterial(undefined); setPresetColor(undefined); setIncomeOpen(true) }}
            style={{ background: 'linear-gradient(135deg, #0891b2, #0f766e)', border: 'none' }}>
            Додати прихід
          </Button>
          <Button danger icon={<MinusOutlined />}
            onClick={() => { setActiveProductId(null); setPresetMaterial(undefined); setPresetColor(undefined); setOutcomeOpen(true) }}>
            Зареєструвати видачу
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Всього на складі', value: store.stats?.totalStock ?? 0, suffix: 'шт', icon: <BarChartOutlined />, color: '#0891b2' },
          { title: 'Нульовий залишок', value: store.stats?.outOfStockCount ?? 0, suffix: 'позицій', icon: <StopOutlined />, color: '#DC2626' },
          { title: 'Мало (< 10 шт)', value: store.stats?.lowStockCount ?? 0, suffix: 'позицій', icon: <WarningOutlined />, color: '#D97706' },
          { title: 'Категорій товарів', value: store.stats?.categoryCount ?? 0, suffix: '', icon: <AppstoreOutlined />, color: '#059669' },
        ].map(s => (
          <Col span={6} key={s.title}>
            <Card>
              <Statistic title={s.title} value={s.value} suffix={s.suffix}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color }} loading={store.statsLoading}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          value={store.categoryFilter || undefined} placeholder="Всі категорії" allowClear style={{ width: 200 }}
          onChange={v => store.setCategoryFilter(v ?? '')}
          options={store.categories.map(c => ({ value: String(c.id), label: c.name }))}
        />
        <Select
          value={store.subcategoryFilter || undefined} placeholder="Всі підкатегорії" allowClear style={{ width: 200 }}
          onChange={v => store.setSubcategoryFilter(v ?? '')}
          options={store.subcategories.map(s => ({ value: String(s.id), label: s.name }))}
        />
        <Select
          value={store.materialFilter || undefined} placeholder="Матеріал" allowClear style={{ width: 140 }}
          onChange={v => store.setMaterialFilter(v ?? '')}
          options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
        />
        <Select
          value={store.colorFilter || undefined} placeholder="Колір" allowClear style={{ width: 160 }}
          onChange={v => store.setColorFilter(v ?? '')}
          options={ALL_COLORS.map(colorOption)}
        />
        <Select
          value={store.statusFilter || undefined} placeholder="Статус" allowClear style={{ width: 140 }}
          onChange={v => store.setStatusFilter(v ?? '')}
          options={[
            { value: 'in_stock', label: 'В наявності' },
            { value: 'low_stock', label: 'Мало' },
            { value: 'out_of_stock', label: 'Немає' },
          ]}
        />
        <Input
          prefix={<SearchOutlined />} placeholder="Пошук..." value={store.search}
          onChange={e => store.setSearch(e.target.value)} style={{ width: 180 }} allowClear
        />
        <Badge count={store.total} showZero overflowCount={999} color="#6B7280">
          <span style={{ color: '#6B7280', fontSize: 13, padding: '4px 8px' }}>товарів</span>
        </Badge>
      </div>

      {/* Table */}
      <Table
        rowKey="id" dataSource={store.products} columns={columns} loading={store.loading}
        pagination={{ current: store.page, pageSize: store.pageSize, total: store.total, onChange: p => store.setPage(p), showSizeChanger: false }}
        expandable={{
          expandedRowRender: r => <ExpandedTransactions productId={r.id} />,
          onExpand: (expanded, r) => {
            if (expanded && !store.productDetails.has(r.id)) store.fetchProductDetail(r.id)
          },
        }}
        onRow={r => ({ onClick: () => openDetail(r.id), style: { cursor: 'pointer' } })}
      />

      <ProductDetailModal productId={activeProductId} open={detailOpen} onClose={() => setDetailOpen(false)}
        onIncome={() => { setDetailOpen(false); if (activeProductId) openIncome(activeProductId) }}
        onOutcome={() => { setDetailOpen(false); if (activeProductId) openOutcome(activeProductId) }}
      />
      <TransactionDrawer open={incomeOpen} type="income" productId={activeProductId}
        presetMaterial={presetMaterial} presetColor={presetColor}
        onClose={() => setIncomeOpen(false)} onSuccess={() => setIncomeOpen(false)}
      />
      <TransactionDrawer open={outcomeOpen} type="outcome" productId={activeProductId}
        presetMaterial={presetMaterial} presetColor={presetColor}
        onClose={() => setOutcomeOpen(false)} onSuccess={() => setOutcomeOpen(false)}
      />
      <CreateProductDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
})

export default WarehousePage
