import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Table, Button, Tag, Select, Input, Card, Row, Col, Modal, Tabs,
  Drawer, Form, InputNumber, DatePicker, Checkbox, Statistic, Space, Badge,
} from 'antd'
import {
  InboxOutlined, PlusOutlined, MinusOutlined, SearchOutlined,
  BarChartOutlined, WarningOutlined, StopOutlined, AppstoreOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { warehouseStore } from '../../stores/WarehouseStore'
import type {
  StockProductSummary, StockMaterial, StockVariantResponse, StockTransactionResponse,
} from '../../api/types'

// ─── Static data ─────────────────────────────────────────────────────────────

const MATERIAL_LABELS: Record<StockMaterial, string> = {
  Atlas: 'Атлас',
  Satin: 'Сатин',
  Silk: 'Шовк',
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

const COLOR_HEX: Record<string, string> = {
  'Білий': '#F8F8F8',
  'Синій': '#1D4ED8',
  'Червоний': '#DC2626',
  'Золотий': '#D97706',
  'Жовто-блакитний': '#FCD34D',
  'Фіолетовий': '#7C3AED',
  'Срібний': '#9CA3AF',
  'Малиновий': '#BE185D',
  'Бузковий': '#A855F7',
  'Рожевий': '#EC4899',
  'Салатовий': '#84CC16',
  'Помаранчевий': '#F97316',
  'Айворі': '#FFFDD0',
  'Жовтий': '#EAB308',
  'Корал': '#FF6B6B',
  "М'ята": '#6EE7B7',
  'Пудра': '#FBCFE8',
  'Персик': '#FDBA74',
  'Блакитний': '#7DD3FC',
  'Смарагд': '#059669',
  'світло-Бордо': '#C0324A',
  'Бордо': '#881337',
  'св.бежевий': '#F5E6CA',
  'т.бежевий': '#C9A96E',
  'Пісочний': '#D4B483',
  'тем.Бордо': '#6B1E35',
  'кремовий': '#FFFACD',
  'Лавандовий': '#E6E6FA',
  'Зелений': '#16A34A',
  'Голубий': '#38BDF8',
}

const STATUS_CONFIG = {
  in_stock: { label: 'В наявності', color: 'green' },
  low_stock: { label: 'Мало', color: 'gold' },
  out_of_stock: { label: 'Немає', color: 'red' },
}

const MATERIALS: StockMaterial[] = ['Atlas', 'Satin', 'Silk']

// ─── Color dot ────────────────────────────────────────────────────────────────

function ColorDot({ color }: { color: string }) {
  const hex = COLOR_HEX[color] ?? '#E5E7EB'
  return (
    <span
      style={{
        display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
        background: hex, border: '1px solid #D1D5DB', marginRight: 6, verticalAlign: 'middle',
      }}
    />
  )
}

// ─── Expanded variants row ────────────────────────────────────────────────────

function ExpandedVariants({
  variants, onIncome, onOutcome,
}: {
  variants: StockVariantResponse[]
  onIncome: (material: StockMaterial, color: string) => void
  onOutcome: (material: StockMaterial, color: string) => void
}) {
  const [hideZero, setHideZero] = useState(true)

  if (variants.length === 0)
    return <span style={{ color: '#9CA3AF' }}>Ще немає надходжень</span>

  const filtered = hideZero ? variants.filter(v => v.currentStock > 0) : variants

  return (
    <div style={{ padding: '8px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Checkbox checked={hideZero} onChange={e => setHideZero(e.target.checked)}>
          Приховати нульові
        </Checkbox>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {filtered.map(v => (
          <div key={v.id} style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8,
            padding: '8px 12px', minWidth: 160,
          }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
              {MATERIAL_LABELS[v.material]}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <ColorDot color={v.color} />
              <span style={{ fontSize: 13 }}>{v.color}</span>
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, marginBottom: 8,
              color: v.currentStock < 10 ? '#EF4444' : '#111827',
            }}>
              {v.currentStock} шт
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button size="small" type="primary" icon={<PlusOutlined />}
                onClick={() => onIncome(v.material, v.color)}
                style={{ fontSize: 11 }}>
                Прихід
              </Button>
              <Button size="small" danger icon={<MinusOutlined />}
                onClick={() => onOutcome(v.material, v.color)}
                style={{ fontSize: 11 }}>
                Видача
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TransactionRow({ t }: { t: StockTransactionResponse }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0', borderBottom: '1px solid #F3F4F6',
    }}>
      <span style={{ fontSize: 18 }}>{t.type === 'income' ? '📦' : '📤'}</span>
      <span style={{ width: 90, color: '#6B7280', fontSize: 13 }}>{t.date}</span>
      <span style={{ width: 50, fontSize: 12, color: '#9CA3AF' }}>{MATERIAL_LABELS[t.material]}</span>
      <span style={{ minWidth: 80, display: 'flex', alignItems: 'center' }}>
        <ColorDot color={t.color} />{t.color}
      </span>
      <span style={{
        width: 60, fontWeight: 600,
        color: t.type === 'income' ? '#16A34A' : '#DC2626',
      }}>
        {t.type === 'income' ? '+' : '-'}{t.quantity}
      </span>
      <span style={{ flex: 1, color: '#6B7280', fontSize: 12 }}>{t.note}</span>
    </div>
  )
}

// ─── Product detail modal ─────────────────────────────────────────────────────

function ProductDetailModal({
  open, onClose, onIncome, onOutcome,
}: {
  open: boolean
  onClose: () => void
  onIncome: (material?: StockMaterial, color?: string) => void
  onOutcome: (material?: StockMaterial, color?: string) => void
}) {
  const { selectedProduct, productDetailLoading } = warehouseStore
  const [hideZero, setHideZero] = useState(true)

  const variants = selectedProduct?.variants ?? []
  const filteredVariants = hideZero ? variants.filter(v => v.currentStock > 0) : variants

  const gridRows: string[] = [...new Set(filteredVariants.map(v => v.color))]
  const gridCols: StockMaterial[] = MATERIALS.filter(m => filteredVariants.some(v => v.material === m))

  const stockMap = new Map(variants.map(v => [`${v.material}:${v.color}`, v]))

  const stockItems = (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Checkbox checked={hideZero} onChange={e => setHideZero(e.target.checked)}>
          Приховати нульові залишки
        </Checkbox>
      </div>
      {gridRows.length === 0 ? (
        <p style={{ color: '#9CA3AF' }}>Немає надходжень</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                  Колір
                </th>
                {gridCols.map(m => (
                  <th key={m} style={{ padding: '6px 12px', textAlign: 'center', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                    {MATERIAL_LABELS[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gridRows.map(color => (
                <tr key={color} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <ColorDot color={color} />{color}
                    </span>
                  </td>
                  {gridCols.map(m => {
                    const v = stockMap.get(`${m}:${color}`)
                    const qty = v?.currentStock ?? 0
                    return (
                      <td key={m} style={{
                        padding: '8px 12px', textAlign: 'center', fontWeight: 600,
                        color: qty === 0 ? '#D1D5DB' : qty < 10 ? '#EF4444' : '#111827',
                      }}>
                        {qty > 0 ? qty : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const historyItems = (
    <div>
      {(selectedProduct?.recentTransactions ?? []).length === 0 ? (
        <p style={{ color: '#9CA3AF' }}>Немає транзакцій</p>
      ) : (
        (selectedProduct?.recentTransactions ?? []).map(t => <TransactionRow key={t.id} t={t} />)
      )}
    </div>
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={820}
      title={
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedProduct?.name ?? '...'}</div>
          <div style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 400 }}>{selectedProduct?.categoryName}</div>
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => onIncome()}>
            Додати прихід
          </Button>
          <Button icon={<MinusOutlined />} danger onClick={() => onOutcome()}>
            Зареєструвати видачу
          </Button>
        </div>
      }
      loading={productDetailLoading}
    >
      <Tabs
        items={[
          { key: 'stock', label: 'Залишки', children: stockItems },
          {
            key: 'history',
            label: `Історія (${selectedProduct?.recentTransactions.length ?? 0})`,
            children: historyItems,
          },
        ]}
      />
    </Modal>
  )
}

// ─── Transaction drawer ───────────────────────────────────────────────────────

function TransactionDrawer({
  open, type, productId, presetMaterial, presetColor, onClose, onSuccess,
}: {
  open: boolean
  type: 'income' | 'outcome'
  productId: number | null
  presetMaterial?: StockMaterial
  presetColor?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<StockMaterial | null>(null)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        productId: productId ?? undefined,
        material: presetMaterial ?? undefined,
        color: presetColor ?? undefined,
        date: dayjs(),
      })
      setSelectedMaterial(presetMaterial ?? null)
    }
  }, [open, productId, presetMaterial, presetColor, form])

  const watchMaterial = Form.useWatch('material', form) as StockMaterial | undefined
  const watchColor = Form.useWatch('color', form) as string | undefined

  const currentVariant = warehouseStore.selectedProduct?.variants.find(
    v => v.material === watchMaterial && v.color === watchColor
  )
  const maxQty = type === 'outcome' ? (currentVariant?.currentStock ?? 0) : undefined

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setLoading(true)
    try {
      await warehouseStore.addTransaction({
        productId: values.productId,
        material: values.material,
        color: values.color,
        type,
        quantity: values.quantity,
        date: (values.date as dayjs.Dayjs).format('YYYY-MM-DD'),
        note: values.note ?? '',
      })
      form.resetFields()
      onSuccess()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Помилка'
      form.setFields([{ name: 'quantity', errors: [msg] }])
    } finally {
      setLoading(false)
    }
  }

  const { products, categories } = warehouseStore

  const productOptions = categories
    .map(cat => ({
      label: cat.name,
      options: products
        .filter(p => p.categoryId === cat.id)
        .map(p => ({ label: p.name, value: p.id })),
    }))
    .filter(g => g.options.length > 0)

  const colorOptions = (selectedMaterial ?? watchMaterial)
    ? COLORS_BY_MATERIAL[(selectedMaterial ?? watchMaterial)!].map(c => ({
        label: <span><ColorDot color={c} />{c}</span>,
        value: c,
      }))
    : []

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {type === 'income'
            ? <><PlusOutlined style={{ color: '#16A34A' }} /><span>Додати прихід</span></>
            : <><MinusOutlined style={{ color: '#DC2626' }} /><span>Зареєструвати видачу</span></>
          }
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Скасувати</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={type === 'outcome' ? { background: '#DC2626', borderColor: '#DC2626' } : {}}
          >
            {type === 'income' ? 'Зберегти прихід' : 'Зберегти видачу'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="productId" label="Товар" rules={[{ required: true, message: 'Оберіть товар' }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={productOptions}
            placeholder="Оберіть товар..."
          />
        </Form.Item>

        <Form.Item name="material" label="Матеріал" rules={[{ required: true, message: 'Оберіть матеріал' }]}>
          <Select
            options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
            placeholder="Атлас / Сатин / Шовк"
            onChange={(v: StockMaterial) => {
              setSelectedMaterial(v)
              form.setFieldValue('color', undefined)
            }}
          />
        </Form.Item>

        <Form.Item name="color" label="Колір" rules={[{ required: true, message: 'Оберіть колір' }]}>
          <Select
            showSearch
            options={colorOptions}
            placeholder={watchMaterial ? 'Оберіть колір...' : 'Спочатку оберіть матеріал'}
            disabled={!watchMaterial}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={
            type === 'outcome' && maxQty !== undefined
              ? `Кількість (є на складі: ${maxQty})`
              : 'Кількість'
          }
          rules={[
            { required: true, message: 'Вкажіть кількість' },
            { type: 'number', min: 1, message: 'Мінімум 1' },
            ...(type === 'outcome' && maxQty !== undefined
              ? [{ type: 'number' as const, max: maxQty, message: `Максимум ${maxQty}` }]
              : []),
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

// ─── Main page ────────────────────────────────────────────────────────────────

const WarehousePage = observer(() => {
  const store = warehouseStore

  const [detailOpen, setDetailOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState<number | null>(null)
  const [presetMaterial, setPresetMaterial] = useState<StockMaterial | undefined>()
  const [presetColor, setPresetColor] = useState<string | undefined>()

  useEffect(() => {
    store.fetchStats()
    store.fetchCategories()
    store.fetchProducts()
  }, [])

  const openDetail = async (id: number) => {
    setActiveProductId(id)
    setDetailOpen(true)
    await store.fetchProductDetail(id)
  }

  const openIncome = (material?: StockMaterial, color?: string) => {
    setPresetMaterial(material)
    setPresetColor(color)
    setIncomeOpen(true)
  }

  const openOutcome = (material?: StockMaterial, color?: string) => {
    setPresetMaterial(material)
    setPresetColor(color)
    setOutcomeOpen(true)
  }

  const handleTransactionSuccess = () => {
    setIncomeOpen(false)
    setOutcomeOpen(false)
    if (activeProductId) store.fetchProductDetail(activeProductId)
  }

  const columns = [
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Категорія',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (v: string) => <span style={{ color: '#6B7280', fontSize: 13 }}>{v}</span>,
    },
    {
      title: 'На складі',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 110,
      render: (v: number) => <strong>{v} шт</strong>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] ?? { label: s, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 110,
      render: (_: unknown, r: StockProductSummary) => (
        <Space>
          <Button size="small" type="primary" icon={<PlusOutlined />}
            onClick={e => { e.stopPropagation(); setActiveProductId(r.id); openIncome() }}>
            Прихід
          </Button>
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
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Залишки стрічок на складі</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setActiveProductId(null); openIncome() }}
          style={{ background: 'linear-gradient(135deg, #0891b2, #0f766e)', border: 'none' }}
        >
          Додати прихід
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всього на складі"
              value={store.stats?.totalStock ?? 0}
              suffix="шт"
              prefix={<BarChartOutlined style={{ color: '#0891b2' }} />}
              valueStyle={{ color: '#0891b2' }}
              loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Нульовий залишок"
              value={store.stats?.outOfStockCount ?? 0}
              suffix="позицій"
              prefix={<StopOutlined style={{ color: '#DC2626' }} />}
              valueStyle={{ color: '#DC2626' }}
              loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Мало (< 10 шт)"
              value={store.stats?.lowStockCount ?? 0}
              suffix="позицій"
              prefix={<WarningOutlined style={{ color: '#D97706' }} />}
              valueStyle={{ color: '#D97706' }}
              loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Категорій товарів"
              value={store.stats?.categoryCount ?? 0}
              prefix={<AppstoreOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669' }}
              loading={store.statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          value={store.categoryFilter || undefined}
          placeholder="Всі категорії"
          allowClear
          style={{ width: 220 }}
          onChange={v => store.setCategoryFilter(v ?? '')}
          options={store.categories.map(c => ({ value: String(c.id), label: c.name }))}
        />
        <Select
          value={store.materialFilter || undefined}
          placeholder="Всі матеріали"
          allowClear
          style={{ width: 160 }}
          onChange={v => store.setMaterialFilter(v ?? '')}
          options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
        />
        <Select
          value={store.statusFilter || undefined}
          placeholder="Всі статуси"
          allowClear
          style={{ width: 160 }}
          onChange={v => store.setStatusFilter(v ?? '')}
          options={[
            { value: 'in_stock', label: 'В наявності' },
            { value: 'low_stock', label: 'Мало' },
            { value: 'out_of_stock', label: 'Немає' },
          ]}
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="Пошук по назві..."
          value={store.search}
          onChange={e => store.setSearch(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
        <Badge count={store.total} showZero overflowCount={999} color="#6B7280">
          <span style={{ color: '#6B7280', fontSize: 13, padding: '4px 8px' }}>товарів</span>
        </Badge>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        dataSource={store.products}
        columns={columns}
        loading={store.loading}
        pagination={{
          current: store.page,
          pageSize: store.pageSize,
          total: store.total,
          onChange: p => store.setPage(p),
          showSizeChanger: false,
        }}
        expandable={{
          expandedRowRender: r => (
            <ExpandedVariants
              variants={store.selectedProduct?.id === r.id ? (store.selectedProduct?.variants ?? []) : []}
              onIncome={(m, c) => { setActiveProductId(r.id); openIncome(m, c) }}
              onOutcome={(m, c) => { setActiveProductId(r.id); openOutcome(m, c) }}
            />
          ),
          onExpand: (expanded, r) => {
            if (expanded) store.fetchProductDetail(r.id)
          },
        }}
        onRow={r => ({
          onClick: () => openDetail(r.id),
          style: { cursor: 'pointer' },
        })}
      />

      {/* Product detail modal */}
      <ProductDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onIncome={(m, c) => { setDetailOpen(false); openIncome(m, c) }}
        onOutcome={(m, c) => { setDetailOpen(false); openOutcome(m, c) }}
      />

      {/* Income drawer */}
      <TransactionDrawer
        open={incomeOpen}
        type="income"
        productId={activeProductId}
        presetMaterial={presetMaterial}
        presetColor={presetColor}
        onClose={() => setIncomeOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Outcome drawer */}
      <TransactionDrawer
        open={outcomeOpen}
        type="outcome"
        productId={activeProductId}
        presetMaterial={presetMaterial}
        presetColor={presetColor}
        onClose={() => setOutcomeOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  )
})

export default WarehousePage
