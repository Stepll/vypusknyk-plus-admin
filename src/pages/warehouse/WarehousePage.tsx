import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Table, Button, Tag, Select, Input, Card, Row, Col, Modal, Tabs,
  Drawer, Form, InputNumber, DatePicker, Statistic, Space, Badge, Spin,
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

// ─── Color dot ────────────────────────────────────────────────────────────────

function ColorDot({ color }: { color: string }) {
  const hex = COLOR_HEX[color] ?? '#E5E7EB'
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
      background: hex, border: '1px solid #D1D5DB', marginRight: 6, verticalAlign: 'middle',
    }} />
  )
}

// ─── Expanded transactions row ────────────────────────────────────────────────

const ExpandedTransactions = observer(({ productId }: { productId: number }) => {
  const detail = warehouseStore.productDetails.get(productId)
  const isLoading = warehouseStore.productDetailsLoading.has(productId)
  const [colorFilter, setColorFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  if (isLoading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Spin size="small" />
      </div>
    )
  }

  if (!detail) return null

  const transactions = detail.transactions.filter(t => {
    if (colorFilter && t.color !== colorFilter) return false
    if (materialFilter && t.material !== materialFilter) return false
    return true
  })

  const availableColors = [...new Set(detail.transactions.map(t => t.color))]
  const availableMaterials = [...new Set(detail.transactions.map(t => t.material))] as StockMaterial[]

  return (
    <div style={{ padding: '12px 16px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Select
          value={colorFilter || undefined}
          placeholder="Всі кольори"
          allowClear
          size="small"
          style={{ width: 160 }}
          onChange={v => setColorFilter(v ?? '')}
          options={availableColors.map(c => ({
            value: c,
            label: <span><ColorDot color={c} />{c}</span>,
          }))}
        />
        <Select
          value={materialFilter || undefined}
          placeholder="Всі матеріали"
          allowClear
          size="small"
          style={{ width: 130 }}
          onChange={v => setMaterialFilter(v ?? '')}
          options={availableMaterials.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
        />
        <span style={{ color: '#9CA3AF', fontSize: 12, lineHeight: '24px' }}>
          {transactions.length} записів
        </span>
      </div>

      {/* Transaction list */}
      <div style={{ height: 280, overflowY: 'auto', borderRadius: 6, border: '1px solid #F3F4F6' }}>
        {transactions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>
            Немає транзакцій
          </div>
        ) : (
          transactions.map(t => <TransactionListItem key={t.id} t={t} />)
        )}
      </div>
    </div>
  )
})

function TransactionListItem({ t }: { t: StockTransactionResponse }) {
  const isIncome = t.type === 'income'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '7px 12px', borderBottom: '1px solid #F9FAFB',
    }}>
      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>
        {isIncome ? '📦' : '📤'}
      </span>
      <span style={{ width: 86, color: '#6B7280', fontSize: 12, flexShrink: 0 }}>{t.date}</span>
      <span style={{ width: 46, fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
        {MATERIAL_LABELS[t.material]}
      </span>
      <span style={{ minWidth: 90, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <ColorDot color={t.color} />
        <span style={{ fontSize: 12 }}>{t.color}</span>
      </span>
      <span style={{
        width: 52, fontWeight: 700, fontSize: 13, flexShrink: 0,
        color: isIncome ? '#16A34A' : '#DC2626',
      }}>
        {isIncome ? '+' : '-'}{t.quantity}
      </span>
      <span style={{ flex: 1, color: '#6B7280', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {t.note}
      </span>
    </div>
  )
}

// ─── Product detail modal ─────────────────────────────────────────────────────

const ProductDetailModal = observer(({
  productId, open, onClose, onIncome, onOutcome,
}: {
  productId: number | null
  open: boolean
  onClose: () => void
  onIncome: () => void
  onOutcome: () => void
}) => {
  const detail = productId ? warehouseStore.productDetails.get(productId) : null
  const isLoading = productId ? warehouseStore.productDetailsLoading.has(productId) : false

  const variants = detail?.variants ?? []
  const allColors = [...new Set(variants.map(v => v.color))]
  const allMaterials = MATERIALS.filter(m => variants.some(v => v.material === m))
  const stockMap = new Map(variants.map(v => [`${v.material}:${v.color}`, v.currentStock]))

  const stockGrid = (
    <div>
      {allColors.length === 0 ? (
        <p style={{ color: '#9CA3AF' }}>Немає надходжень</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                  Колір
                </th>
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
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <ColorDot color={color} />{color}
                    </span>
                  </td>
                  {allMaterials.map(m => {
                    const qty = stockMap.get(`${m}:${color}`) ?? 0
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
    <div style={{ height: 380, overflowY: 'auto' }}>
      {(detail?.transactions ?? []).length === 0 ? (
        <p style={{ color: '#9CA3AF' }}>Немає транзакцій</p>
      ) : (
        (detail?.transactions ?? []).map(t => <TransactionListItem key={t.id} t={t} />)
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
          <div style={{ fontWeight: 600, fontSize: 16 }}>{detail?.name ?? '...'}</div>
          <div style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 400 }}>{detail?.categoryName}</div>
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
      <Tabs
        items={[
          { key: 'stock', label: 'Залишки', children: stockGrid },
          {
            key: 'history',
            label: `Історія (${detail?.transactions.length ?? 0})`,
            children: historyItems,
          },
        ]}
      />
    </Modal>
  )
})

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

  const watchMaterial = Form.useWatch('material', form) as StockMaterial | undefined
  const watchColor = Form.useWatch('color', form) as string | undefined

  const currentVariant = productId
    ? warehouseStore.productDetails.get(productId)?.variants.find(
        v => v.material === watchMaterial && v.color === watchColor
      )
    : undefined
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
      form.setFields([{ name: 'quantity', errors: [e instanceof Error ? e.message : 'Помилка'] }])
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

  const colorOptions = watchMaterial
    ? COLORS_BY_MATERIAL[watchMaterial].map(c => ({
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
            : <><MinusOutlined style={{ color: '#DC2626' }} /><span>Зареєструвати видачу</span></>}
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Скасувати</Button>
          <Button
            type="primary" loading={loading} onClick={handleSubmit}
            style={type === 'outcome' ? { background: '#DC2626', borderColor: '#DC2626' } : {}}
          >
            {type === 'income' ? 'Зберегти прихід' : 'Зберегти видачу'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="productId" label="Товар" rules={[{ required: true, message: 'Оберіть товар' }]}>
          <Select showSearch optionFilterProp="label" options={productOptions} placeholder="Оберіть товар..." />
        </Form.Item>
        <Form.Item name="material" label="Матеріал" rules={[{ required: true, message: 'Оберіть матеріал' }]}>
          <Select
            options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
            placeholder="Атлас / Сатин / Шовк"
            onChange={() => form.setFieldValue('color', undefined)}
          />
        </Form.Item>
        <Form.Item name="color" label="Колір" rules={[{ required: true, message: 'Оберіть колір' }]}>
          <Select
            showSearch options={colorOptions}
            placeholder={watchMaterial ? 'Оберіть колір...' : 'Спочатку оберіть матеріал'}
            disabled={!watchMaterial}
          />
        </Form.Item>
        <Form.Item
          name="quantity"
          label={type === 'outcome' && maxQty !== undefined ? `Кількість (є на складі: ${maxQty})` : 'Кількість'}
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

  const openIncome = (id: number, material?: StockMaterial, color?: string) => {
    setActiveProductId(id)
    setPresetMaterial(material)
    setPresetColor(color)
    setIncomeOpen(true)
  }

  const openOutcome = (id: number, material?: StockMaterial, color?: string) => {
    setActiveProductId(id)
    setPresetMaterial(material)
    setPresetColor(color)
    setOutcomeOpen(true)
  }

  const openDetail = (id: number) => {
    setActiveProductId(id)
    store.modalProductId = id
    setDetailOpen(true)
    if (!store.productDetails.has(id)) store.fetchProductDetail(id)
  }

  const handleTransactionSuccess = () => {
    setIncomeOpen(false)
    setOutcomeOpen(false)
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
      width: 160,
      render: (_: unknown, r: StockProductSummary) => (
        <Space onClick={e => e.stopPropagation()}>
          <Button size="small" type="primary" icon={<PlusOutlined />}
            onClick={() => openIncome(r.id)}>
            Прихід
          </Button>
          <Button size="small" danger icon={<MinusOutlined />}
            onClick={() => openOutcome(r.id)}>
            Видача
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
        <Space>
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={() => { setActiveProductId(null); setPresetMaterial(undefined); setPresetColor(undefined); setIncomeOpen(true) }}
            style={{ background: 'linear-gradient(135deg, #0891b2, #0f766e)', border: 'none' }}
          >
            Додати прихід
          </Button>
          <Button
            danger icon={<MinusOutlined />}
            onClick={() => { setActiveProductId(null); setPresetMaterial(undefined); setPresetColor(undefined); setOutcomeOpen(true) }}
          >
            Зареєструвати видачу
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всього на складі" value={store.stats?.totalStock ?? 0} suffix="шт"
              prefix={<BarChartOutlined style={{ color: '#0891b2' }} />}
              valueStyle={{ color: '#0891b2' }} loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Нульовий залишок" value={store.stats?.outOfStockCount ?? 0} suffix="позицій"
              prefix={<StopOutlined style={{ color: '#DC2626' }} />}
              valueStyle={{ color: '#DC2626' }} loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Мало (< 10 шт)" value={store.stats?.lowStockCount ?? 0} suffix="позицій"
              prefix={<WarningOutlined style={{ color: '#D97706' }} />}
              valueStyle={{ color: '#D97706' }} loading={store.statsLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Категорій товарів" value={store.stats?.categoryCount ?? 0}
              prefix={<AppstoreOutlined style={{ color: '#059669' }} />}
              valueStyle={{ color: '#059669' }} loading={store.statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          value={store.categoryFilter || undefined} placeholder="Всі категорії" allowClear style={{ width: 220 }}
          onChange={v => store.setCategoryFilter(v ?? '')}
          options={store.categories.map(c => ({ value: String(c.id), label: c.name }))}
        />
        <Select
          value={store.materialFilter || undefined} placeholder="Всі матеріали" allowClear style={{ width: 160 }}
          onChange={v => store.setMaterialFilter(v ?? '')}
          options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
        />
        <Select
          value={store.statusFilter || undefined} placeholder="Всі статуси" allowClear style={{ width: 160 }}
          onChange={v => store.setStatusFilter(v ?? '')}
          options={[
            { value: 'in_stock', label: 'В наявності' },
            { value: 'low_stock', label: 'Мало' },
            { value: 'out_of_stock', label: 'Немає' },
          ]}
        />
        <Input
          prefix={<SearchOutlined />} placeholder="Пошук по назві..."
          value={store.search} onChange={e => store.setSearch(e.target.value)}
          style={{ width: 220 }} allowClear
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
          expandedRowRender: r => <ExpandedTransactions productId={r.id} />,
          onExpand: (expanded, r) => {
            if (expanded && !store.productDetails.has(r.id)) {
              store.fetchProductDetail(r.id)
            }
          },
        }}
        onRow={r => ({
          onClick: () => openDetail(r.id),
          style: { cursor: 'pointer' },
        })}
      />

      {/* Product detail modal */}
      <ProductDetailModal
        productId={activeProductId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onIncome={() => { setDetailOpen(false); if (activeProductId) openIncome(activeProductId) }}
        onOutcome={() => { setDetailOpen(false); if (activeProductId) openOutcome(activeProductId) }}
      />

      {/* Income drawer */}
      <TransactionDrawer
        open={incomeOpen} type="income"
        productId={activeProductId}
        presetMaterial={presetMaterial} presetColor={presetColor}
        onClose={() => setIncomeOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Outcome drawer */}
      <TransactionDrawer
        open={outcomeOpen} type="outcome"
        productId={activeProductId}
        presetMaterial={presetMaterial} presetColor={presetColor}
        onClose={() => setOutcomeOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  )
})

export default WarehousePage
