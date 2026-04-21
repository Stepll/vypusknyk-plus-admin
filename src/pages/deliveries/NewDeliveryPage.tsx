import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Button, Form, Input, Select, DatePicker, InputNumber,
  Table, message, Spin,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, TruckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { deliveryStore } from '../../stores/DeliveryStore'
import { warehouseStore } from '../../stores/WarehouseStore'
import { createDelivery } from '../../api/deliveries'
import type { StockProductSummary } from '../../api/types'

const MATERIAL_LABELS: Record<string, string> = {
  Atlas: 'Атлас', Satin: 'Сатин', Silk: 'Шовк',
}
const MATERIALS = ['Atlas', 'Satin', 'Silk']

const COLORS_BY_MATERIAL: Record<string, string[]> = {
  Atlas: ['Білий', 'Синій', 'Червоний', 'Золотий', 'Жовто-блакитний', 'Фіолетовий', 'Срібний', 'Малиновий', 'Бузковий', 'Рожевий', 'Салатовий', 'Помаранчевий', 'Айворі', 'Жовтий', 'Корал', "М'ята", 'Пудра', 'Персик', 'Блакитний', 'Смарагд', 'світло-Бордо'],
  Satin: ['Білий', 'Айворі', 'Синій', 'Блакитний', 'Жовтий', 'св.бежевий', 'т.бежевий', 'Пісочний', 'Срібний', 'Малиновий', 'тем.Бордо', 'кремовий', 'Персик', 'Смарагд', 'Помаранчевий', 'Лавандовий'],
  Silk:  ['Білий', 'Синій', 'Бордо', 'Червоний', 'Жовто-блакитний', 'Фіолетовий', 'Рожевий', 'Салатовий', 'Зелений', 'Голубий'],
}
const ALL_COLORS = [...new Set(Object.values(COLORS_BY_MATERIAL).flat())]

interface ItemRow {
  key: string
  productId: number | null
  material: string
  color: string
  expectedQty: number
  product: StockProductSummary | null
}

function makeRow(): ItemRow {
  return { key: crypto.randomUUID(), productId: null, material: '', color: '', expectedQty: 1, product: null }
}

const NewDeliveryPage = observer(() => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [items, setItems] = useState<ItemRow[]>([makeRow()])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    deliveryStore.fetchSuppliers()
    warehouseStore.fetchCategories()
    if (warehouseStore.products.length === 0) {
      warehouseStore.pageSize = 500
      warehouseStore.fetchProducts()
    }
  }, [])

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

  const updateItem = (key: string, patch: Partial<ItemRow>) => {
    setItems(prev => prev.map(r => r.key === key ? { ...r, ...patch } : r))
  }

  const handleProductChange = (key: string, productId: number) => {
    const product = products.find(p => p.id === productId) ?? null
    updateItem(key, { productId, product, material: '', color: '' })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const invalidItems = items.filter(r => !r.productId || r.expectedQty < 1)
    if (invalidItems.length > 0) {
      message.error('Заповніть всі поля в позиціях')
      return
    }
    const missingMaterial = items.some(r => r.product?.hasMaterial && !r.material)
    if (missingMaterial) { message.error('Вкажіть матеріал для всіх позицій'); return }
    const missingColor = items.some(r => r.product?.hasColor && !r.color)
    if (missingColor) { message.error('Вкажіть колір для всіх позицій'); return }

    setSubmitting(true)
    try {
      const result = await createDelivery({
        supplierId: values.supplierId ?? null,
        expectedDate: (values.expectedDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        note: values.note ?? null,
        items: items.map(r => ({
          productId: r.productId!,
          material: r.material,
          color: r.color,
          expectedQty: r.expectedQty,
        })),
      })
      message.success(`Поставку ${result.number} створено`)
      navigate(`/deliveries/${result.id}`)
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      title: 'Товар', key: 'product', width: '35%',
      render: (_: unknown, r: ItemRow) => (
        <Select
          showSearch optionFilterProp="label"
          value={r.productId ?? undefined}
          placeholder="Оберіть товар..."
          options={productOptions}
          style={{ width: '100%' }}
          onChange={(v: number) => handleProductChange(r.key, v)}
        />
      ),
    },
    {
      title: 'Матеріал', key: 'material', width: 130,
      render: (_: unknown, r: ItemRow) => !r.product || r.product.hasMaterial ? (
        <Select
          value={r.material || undefined}
          placeholder="Матеріал"
          style={{ width: '100%' }}
          disabled={!r.productId}
          options={MATERIALS.map(m => ({ value: m, label: MATERIAL_LABELS[m] }))}
          onChange={v => updateItem(r.key, { material: v, color: '' })}
        />
      ) : <span style={{ color: '#D1D5DB', fontSize: 13, paddingLeft: 8 }}>—</span>,
    },
    {
      title: 'Колір', key: 'color', width: 160,
      render: (_: unknown, r: ItemRow) => !r.product || r.product.hasColor ? (
        <Select
          showSearch
          value={r.color || undefined}
          placeholder={r.product?.hasMaterial && !r.material ? 'Спочатку матеріал' : 'Колір'}
          style={{ width: '100%' }}
          disabled={!r.productId || (r.product?.hasMaterial === true && !r.material)}
          options={(r.product?.hasMaterial ? (r.material ? COLORS_BY_MATERIAL[r.material] ?? ALL_COLORS : []) : ALL_COLORS)
            .map(c => ({ value: c, label: c }))}
          onChange={v => updateItem(r.key, { color: v })}
        />
      ) : <span style={{ color: '#D1D5DB', fontSize: 13, paddingLeft: 8 }}>—</span>,
    },
    {
      title: 'Очікувана кількість', key: 'qty', width: 160,
      render: (_: unknown, r: ItemRow) => (
        <InputNumber
          min={1} value={r.expectedQty} style={{ width: '100%' }}
          onChange={v => updateItem(r.key, { expectedQty: v ?? 1 })}
        />
      ),
    },
    {
      title: '', key: 'remove', width: 48,
      render: (_: unknown, r: ItemRow) => (
        <Button danger type="text" icon={<DeleteOutlined />}
          disabled={items.length === 1}
          onClick={() => setItems(prev => prev.filter(i => i.key !== r.key))}
        />
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/deliveries')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <TruckOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Нова поставка</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Оформлення нової поставки від постачальника</p>
          </div>
        </div>
      </div>

      {/* Form header fields */}
      <Form form={form} layout="vertical" style={{ maxWidth: 720, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Form.Item name="supplierId" label="Постачальник" style={{ flex: '1 1 220px' }}>
            <Select
              placeholder="Оберіть постачальника..."
              allowClear
              options={deliveryStore.suppliers.map(s => ({ value: s.id, label: s.name }))}
              notFoundContent={
                deliveryStore.suppliers.length === 0
                  ? <span style={{ color: '#9CA3AF', fontSize: 12 }}>Постачальників ще немає</span>
                  : undefined
              }
            />
          </Form.Item>
          <Form.Item name="expectedDate" label="Очікувана дата" style={{ flex: '1 1 180px' }}
            rules={[{ required: true, message: 'Вкажіть дату' }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="note" label="Примітка" style={{ flex: '1 1 240px' }}>
            <Input placeholder="Необов'язково..." />
          </Form.Item>
        </div>
      </Form>

      {/* Items */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Позиції ({items.length})</h3>
        <Button icon={<PlusOutlined />} onClick={() => setItems(prev => [...prev, makeRow()])}>
          Додати позицію
        </Button>
      </div>

      {warehouseStore.loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        : (
          <Table
            rowKey="key"
            dataSource={items}
            columns={columns}
            pagination={false}
            style={{ marginBottom: 24 }}
          />
        )
      }

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button onClick={() => navigate('/deliveries')}>Скасувати</Button>
        <Button type="primary" loading={submitting} onClick={handleSubmit}
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', border: 'none' }}>
          Створити поставку
        </Button>
      </div>
    </div>
  )
})

export default NewDeliveryPage
