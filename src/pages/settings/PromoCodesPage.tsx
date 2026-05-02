import { useEffect, useRef, useState } from 'react'
import {
  Button, ColorPicker, DatePicker, Drawer, Form, Input, InputNumber,
  Popconfirm, Select, Switch, Table, Tag, message,
} from 'antd'
import { DeleteOutlined, EditOutlined, GiftOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getAdminPromoCodes, createPromoCode, updatePromoCode, deletePromoCode,
} from '../../api/promotions'
import type { AdminPromoCodeResponse, SavePromoCodeRequest } from '../../api/promotions'

const { RangePicker } = DatePicker

const STATUS_TAGS: Record<string, { color: string; label: string }> = {
  active: { color: 'success', label: 'Активний' },
  upcoming: { color: 'processing', label: 'Запланований' },
  expired: { color: 'default', label: 'Завершений' },
  inactive: { color: 'error', label: 'Вимкнений' },
}

const PRESET_COLORS = [
  '#FF6B9D', '#E91E8C', '#D6336C', '#C2185B',
  '#FF8C42', '#F59E0B', '#22C55E', '#3B82F6',
  '#7C3AED', '#EC4899', '#0EA5E9', '#6366F1',
]

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function CardPreview({ color, displayName, discountType, discountValue, description, endsAt }: {
  color: string
  displayName: string
  discountType: string
  discountValue?: number
  description?: string
  endsAt?: string
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      borderRadius: 12,
      padding: '16px 20px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 20,
      boxShadow: `0 4px 20px ${color}66`,
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: -10, width: 80, height: 80,
        borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
      }} />
      <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
        Випускник+
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
        {displayName || 'Назва акції'}
      </div>
      {discountValue && (
        <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.95 }}>
          {discountType === 'Percentage' ? `−${discountValue}%` : `−${discountValue} ₴`} на замовлення
        </div>
      )}
      {description && (
        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>{description}</div>
      )}
      {endsAt && (
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
          до {new Date(endsAt).toLocaleDateString('uk-UA')}
        </div>
      )}
    </div>
  )
}

export default function PromoCodesPage() {
  const [items, setItems] = useState<AdminPromoCodeResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPromoCodeResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [cardColor, setCardColor] = useState('#FF6B9D')
  const [previewData, setPreviewData] = useState({ displayName: '', discountType: 'Percentage', discountValue: undefined as number | undefined, description: '', endsAt: '' })
  const [form] = Form.useForm()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminPromoCodes()
      setItems(data)
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

  const syncPreview = () => {
    const vals = form.getFieldsValue()
    const dateRange = vals.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined
    setPreviewData({
      displayName: vals.displayName || '',
      discountType: vals.discountType || 'Percentage',
      discountValue: vals.discountValue,
      description: vals.description || '',
      endsAt: dateRange?.[1]?.toISOString() || '',
    })
  }

  const openCreate = () => {
    setEditing(null)
    setCardColor('#FF6B9D')
    form.resetFields()
    form.setFieldsValue({ isActive: true, discountType: 'Percentage' })
    setPreviewData({ displayName: '', discountType: 'Percentage', discountValue: undefined, description: '', endsAt: '' })
    setDrawerOpen(true)
  }

  const openEdit = (item: AdminPromoCodeResponse) => {
    setEditing(item)
    setCardColor(item.cardColor)
    form.setFieldsValue({
      code: item.code,
      displayName: item.displayName,
      description: item.description,
      discountType: item.discountType,
      discountValue: item.discountValue,
      minOrderAmount: item.minOrderAmount,
      maxUsages: item.maxUsages,
      isOneTimePerUser: item.isOneTimePerUser,
      isActive: item.isActive,
      dateRange: item.startsAt || item.endsAt
        ? [item.startsAt ? dayjs(item.startsAt) : null, item.endsAt ? dayjs(item.endsAt) : null]
        : undefined,
    })
    setPreviewData({
      displayName: item.displayName,
      discountType: item.discountType,
      discountValue: item.discountValue,
      description: item.description || '',
      endsAt: item.endsAt || '',
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const handleSave = async (values: Record<string, unknown>) => {
    setSaving(true)
    try {
      const [start, end] = (values.dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined) ?? [null, null]
      const req: SavePromoCodeRequest = {
        code: (values.code as string).trim().toUpperCase(),
        displayName: values.displayName as string,
        cardColor,
        description: values.description as string | undefined,
        discountType: values.discountType as string,
        discountValue: values.discountValue as number,
        minOrderAmount: values.minOrderAmount as number | undefined,
        maxUsages: values.maxUsages as number | undefined,
        isOneTimePerUser: values.isOneTimePerUser as boolean ?? false,
        startsAt: start?.toISOString(),
        endsAt: end?.toISOString(),
        isActive: values.isActive as boolean,
      }
      if (editing) {
        const updated = await updatePromoCode(editing.id, req)
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
        message.success('Промокод оновлено')
      } else {
        const created = await createPromoCode(req)
        setItems(prev => [...prev, created])
        message.success('Промокод створено')
      }
      closeDrawer()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Помилка при збереженні'
      message.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePromoCode(id)
      setItems(prev => prev.filter(i => i.id !== id))
      message.success('Промокод видалено')
    } catch {
      message.error('Помилка при видаленні')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Картка',
      key: 'card',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.cardColor, flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{item.displayName}</span>
        </div>
      ),
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}>{code}</Tag>
      ),
    },
    {
      title: 'Знижка',
      key: 'discount',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <Tag color="volcano" style={{ fontWeight: 600 }}>
          {item.discountType === 'Percentage' ? `${item.discountValue}%` : `${item.discountValue} ₴`}
        </Tag>
      ),
    },
    {
      title: 'Використань',
      key: 'usages',
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <span style={{ color: '#595959' }}>
          {item.usagesCount}{item.maxUsages ? `/${item.maxUsages}` : ''}
        </span>
      ),
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
      render: (_: unknown, item: AdminPromoCodeResponse) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)} />
          <Popconfirm
            title="Видалити промокод?"
            description="Активовані картки у юзерів залишаться"
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
            background: 'linear-gradient(135deg, #FF6B9D 0%, #D6336C 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <GiftOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Промокоди</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Картки знижок для користувачів</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Новий промокод
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
        title={editing ? 'Редагувати промокод' : 'Новий промокод'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={480}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={closeDrawer}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {editing ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        }
      >
        <CardPreview
          color={cardColor}
          displayName={previewData.displayName}
          discountType={previewData.discountType}
          discountValue={previewData.discountValue}
          description={previewData.description}
          endsAt={previewData.endsAt}
        />

        <Form form={form} layout="vertical" onFinish={handleSave} onValuesChange={syncPreview}>
          <Form.Item label="Назва картки (бачить юзер)" name="displayName" rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="Весняна знижка" />
          </Form.Item>

          <Form.Item label="Код (прихований від юзера)" name="code" rules={[{ required: true, message: 'Введіть код' }]}>
            <Input
              placeholder="SPRING2025"
              style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}
              addonAfter={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() => form.setFieldValue('code', generateCode())}
                  style={{ height: 20, padding: '0 4px' }}
                />
              }
            />
          </Form.Item>

          <Form.Item label="Опис" name="description">
            <Input.TextArea rows={2} placeholder="Необов'язковий опис для картки" />
          </Form.Item>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: '#262626' }}>Колір картки</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {PRESET_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => { setCardColor(color); syncPreview() }}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: color,
                    cursor: 'pointer',
                    border: cardColor === color ? '3px solid #1677ff' : '3px solid transparent',
                    outline: cardColor === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2, transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
            <ColorPicker
              value={cardColor}
              onChange={c => { setCardColor(c.toHexString()); syncPreview() }}
              showText
            />
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item label="Мін. сума (₴)" name="minOrderAmount">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Без обмежень" />
            </Form.Item>
            <Form.Item label="Ліміт використань" name="maxUsages">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Безліміт" />
            </Form.Item>
          </div>

          <Form.Item label="Термін дії" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              showTime
              format="DD.MM.YYYY HH:mm"
              placeholder={['Початок', 'Кінець']}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item label="Активний" name="isActive" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item label="Один раз на юзера" name="isOneTimePerUser" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  )
}
