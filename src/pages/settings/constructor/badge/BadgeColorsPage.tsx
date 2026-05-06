import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { BgColorsOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getBadgeTextColors, createBadgeTextColor, updateBadgeTextColor, deleteBadgeTextColor,
} from '../../../../api/badgeTextColors'
import type { BadgeTextColorResponse, SaveBadgeTextColorRequest } from '../../../../api/types'

const EMPTY: SaveBadgeTextColorRequest = { name: '', hex: '#000000', priceModifier: 0, isActive: true, sortOrder: 0 }

export default function BadgeColorsPage() {
  const [colors, setColors]       = useState<BadgeTextColorResponse[]>([])
  const [loading, setLoading]     = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]     = useState<BadgeTextColorResponse | null>(null)
  const [saving, setSaving]       = useState(false)
  const [hexPreview, setHexPreview] = useState('#000000')
  const [form] = Form.useForm<SaveBadgeTextColorRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const data = await getBadgeTextColors()
      setColors(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити кольори')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setHexPreview(EMPTY.hex)
    setDrawerOpen(true)
  }

  const openEdit = (c: BadgeTextColorResponse) => {
    setEditing(c)
    form.setFieldsValue(c)
    setHexPreview(c.hex)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateBadgeTextColor(editing.id, vals)
        setColors(cs => cs.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await createBadgeTextColor(vals)
        setColors(cs => [...cs, created])
      }
      setDrawerOpen(false)
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBadgeTextColor(id)
      setColors(cs => cs.filter(c => c.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (c: BadgeTextColorResponse, val: boolean) => {
    try {
      const updated = await updateBadgeTextColor(c.id, { ...c, isActive: val })
      setColors(cs => cs.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Колір',
      key: 'swatch',
      width: 60,
      render: (_: unknown, c: BadgeTextColorResponse) => (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: c.hex,
          border: '2px solid #e8e8e8', flexShrink: 0,
        }} />
      ),
    },
    { title: 'Назва', dataIndex: 'name', key: 'name', render: (v: string) => <strong>{v}</strong> },
    {
      title: 'HEX',
      dataIndex: 'hex',
      key: 'hex',
      render: (v: string) => <Tag style={{ fontFamily: 'monospace' }}>{v}</Tag>,
    },
    {
      title: 'Надбавка',
      dataIndex: 'priceModifier',
      key: 'priceModifier',
      render: (v: number) => v > 0 ? <Tag color="orange">+{v} ₴</Tag> : <span style={{ color: '#d9d9d9' }}>—</span>,
    },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, c: BadgeTextColorResponse) => (
        <Switch checked={c.isActive} onChange={val => handleToggle(c, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, c: BadgeTextColorResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(c)} />
          <Popconfirm title="Видалити колір?" onConfirm={() => handleDelete(c.id)} okText="Так" cancelText="Ні">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <BgColorsOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Кольори тексту</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Кольори напису на значку</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table rowKey="id" dataSource={colors} columns={columns} loading={loading} pagination={false} />

      <Drawer
        title={editing ? 'Редагувати колір' : 'Новий колір'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="Золотий" />
          </Form.Item>

          <Form.Item name="hex" label="HEX колір" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Space.Compact style={{ width: '100%' }}>
              <input
                type="color"
                value={hexPreview}
                onChange={e => {
                  setHexPreview(e.target.value)
                  form.setFieldValue('hex', e.target.value)
                }}
                style={{ width: 40, height: 32, padding: 2, border: '1px solid #d9d9d9', borderRadius: '6px 0 0 6px', cursor: 'pointer' }}
              />
              <Input
                value={hexPreview}
                onChange={e => {
                  setHexPreview(e.target.value)
                  form.setFieldValue('hex', e.target.value)
                }}
                placeholder="#000000"
                style={{ borderRadius: '0 6px 6px 0' }}
              />
            </Space.Compact>
          </Form.Item>

          <Form.Item name="priceModifier" label="Надбавка до ціни (₴)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>

          <Form.Item name="sortOrder" label="Порядок сортування">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="Активний" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
