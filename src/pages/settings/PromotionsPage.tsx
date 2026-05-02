import { useEffect, useRef, useState } from 'react'
import {
  Button, DatePicker, Drawer, Form, Input, InputNumber, Popconfirm,
  Select, Switch, Table, Tag, message,
} from 'antd'
import {
  DeleteOutlined, EditOutlined, PercentageOutlined, PlusOutlined,
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getAdminPromotions, createPromotion, updatePromotion, deletePromotion,
} from '../../api/promotions'
import { getProductCategories } from '../../api/productCategories'
import type { AdminPromotionResponse, SavePromotionRequest } from '../../api/promotions'
import type { ProductCategoryResponse } from '../../api/types'

const { RangePicker } = DatePicker

const STATUS_TAGS: Record<string, { color: string; label: string }> = {
  active: { color: 'success', label: 'Активна' },
  upcoming: { color: 'processing', label: 'Запланована' },
  expired: { color: 'default', label: 'Завершена' },
  inactive: { color: 'error', label: 'Вимкнена' },
}

export default function PromotionsPage() {
  const [items, setItems] = useState<AdminPromotionResponse[]>([])
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPromotionResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [scope, setScope] = useState('Global')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [form] = Form.useForm()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const [data, cats] = await Promise.all([getAdminPromotions(), getProductCategories()])
      setItems(data)
      setCategories(cats)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setScope('Global')
    setCategoryId(undefined)
    form.resetFields()
    form.setFieldsValue({ isActive: true, discountType: 'Percentage', scope: 'Global' })
    setDrawerOpen(true)
  }

  const openEdit = (item: AdminPromotionResponse) => {
    setEditing(item)
    setScope(item.scope)
    setCategoryId(item.categoryId)
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      discountType: item.discountType,
      discountValue: item.discountValue,
      scope: item.scope,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId,
      minOrderAmount: item.minOrderAmount,
      isActive: item.isActive,
      isOneTimePerUser: item.isOneTimePerUser,
      dateRange: item.startsAt || item.endsAt
        ? [item.startsAt ? dayjs(item.startsAt) : null, item.endsAt ? dayjs(item.endsAt) : null]
        : undefined,
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setScope('Global')
    setCategoryId(undefined)
    form.resetFields()
  }

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      const [start, end] = (values.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined) ?? [null, null]
      const req: SavePromotionRequest = {
        name: values.name as string,
        description: values.description as string | undefined,
        discountType: values.discountType as string,
        discountValue: values.discountValue as number,
        scope: values.scope as string,
        categoryId: values.categoryId as number | undefined,
        subcategoryId: values.subcategoryId as number | undefined,
        minOrderAmount: values.minOrderAmount as number | undefined,
        startsAt: start?.toISOString(),
        endsAt: end?.toISOString(),
        isActive: values.isActive as boolean,
        isOneTimePerUser: values.isOneTimePerUser as boolean,
      }
      if (editing) {
        const updated = await updatePromotion(editing.id, req)
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
        message.success('Акцію оновлено')
      } else {
        const created = await createPromotion(req)
        setItems(prev => [...prev, created])
        message.success('Акцію створено')
      }
      closeDrawer()
    } catch {
      message.error('Помилка при збереженні')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePromotion(id)
      setItems(prev => prev.filter(i => i.id !== id))
      message.success('Акцію видалено')
    } catch {
      message.error('Помилка при видаленні')
    }
  }

  const selectedCategory = categories.find(c => c.id === categoryId)

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Знижка',
      key: 'discount',
      render: (_: unknown, item: AdminPromotionResponse) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {item.discountType === 'Percentage' ? `${item.discountValue}%` : `${item.discountValue} ₴`}
        </Tag>
      ),
    },
    {
      title: 'Область',
      dataIndex: 'scope',
      key: 'scope',
      render: (scope: string) => {
        const labels: Record<string, string> = {
          Global: 'Всі товари', Category: 'Категорія',
          Subcategory: 'Підкатегорія', Product: 'Продукт',
        }
        return <span style={{ color: '#595959' }}>{labels[scope] ?? scope}</span>
      },
    },
    {
      title: 'Термін',
      key: 'period',
      render: (_: unknown, item: AdminPromotionResponse) => {
        if (!item.startsAt && !item.endsAt) return <span style={{ color: '#bfbfbf' }}>Безмежно</span>
        const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('uk-UA') : '∞'
        return <span>{fmt(item.startsAt)} — {fmt(item.endsAt)}</span>
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const t = STATUS_TAGS[s] ?? { color: 'default', label: s }
        return <Tag color={t.color}>{t.label}</Tag>
      },
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, item: AdminPromotionResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)} />
          <Popconfirm
            title="Видалити акцію?"
            okText="Так"
            cancelText="Ні"
            onConfirm={() => handleDelete(item.id)}
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f5222d 0%, #fa541c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PercentageOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Акції</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Автоматичні знижки на замовлення</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Нова акція
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати акцію' : 'Нова акція'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={460}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={closeDrawer}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {editing ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Назва" name="name" rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="Весняний розпродаж" />
          </Form.Item>

          <Form.Item label="Опис" name="description">
            <Input.TextArea rows={2} placeholder="Необов'язковий опис" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item label="Тип знижки" name="discountType" initialValue="Percentage">
              <Select options={[
                { value: 'Percentage', label: 'Відсоток (%)' },
                { value: 'FixedAmount', label: 'Фіксована сума (₴)' },
              ]} />
            </Form.Item>
            <Form.Item label="Розмір знижки" name="discountValue" rules={[{ required: true, message: 'Введіть розмір' }]}>
              <InputNumber min={0.01} style={{ width: '100%' }} placeholder="10" />
            </Form.Item>
          </div>

          <Form.Item label="Мінімальна сума замовлення (₴)" name="minOrderAmount">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Без обмежень" />
          </Form.Item>

          <Form.Item label="Область застосування" name="scope" initialValue="Global">
            <Select
              onChange={v => { setScope(v); setCategoryId(undefined); form.setFieldValue('subcategoryId', undefined) }}
              options={[
                { value: 'Global', label: 'Всі товари' },
                { value: 'Category', label: 'Категорія' },
                { value: 'Subcategory', label: 'Підкатегорія' },
              ]}
            />
          </Form.Item>

          {(scope === 'Category' || scope === 'Subcategory') && (
            <Form.Item label="Категорія" name="categoryId" rules={[{ required: true, message: 'Оберіть категорію' }]}>
              <Select
                onChange={v => { setCategoryId(v); form.setFieldValue('subcategoryId', undefined) }}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Оберіть категорію"
              />
            </Form.Item>
          )}

          {scope === 'Subcategory' && selectedCategory && (
            <Form.Item label="Підкатегорія" name="subcategoryId" rules={[{ required: true, message: 'Оберіть підкатегорію' }]}>
              <Select
                options={selectedCategory.subcategories.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Оберіть підкатегорію"
              />
            </Form.Item>
          )}

          <Form.Item label="Термін дії" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder={['Початок (необов\'язково)', 'Кінець (необов\'язково)']}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item label="Активна" name="isActive" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item label="Одноразова для юзера" name="isOneTimePerUser" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  )
}
