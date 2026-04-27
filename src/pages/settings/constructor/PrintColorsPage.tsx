import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { FormatPainterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getRibbonPrintColors, createRibbonPrintColor, updateRibbonPrintColor, deleteRibbonPrintColor,
} from '../../../api/ribbonPrintColors'
import type { RibbonPrintColorResponse, SaveRibbonPrintColorRequest } from '../../../api/types'

const EMPTY: SaveRibbonPrintColorRequest = {
  name: '', slug: '', hex: '#000000', priceModifier: 0,
  isForMainText: true, isForExtraText: false, isActive: true, sortOrder: 0,
}

export default function PrintColorsPage() {
  const [colors, setColors] = useState<RibbonPrintColorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonPrintColorResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveRibbonPrintColorRequest>()

  const hexWatch = Form.useWatch('hex', form)

  const load = () => {
    setLoading(true)
    getRibbonPrintColors()
      .then(setColors)
      .catch(() => message.error('Не вдалося завантажити кольори друку'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (c: RibbonPrintColorResponse) => {
    setEditing(c)
    form.setFieldsValue(c)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonPrintColor(editing.id, vals)
        setColors(cs => cs.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await createRibbonPrintColor(vals)
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
      await deleteRibbonPrintColor(id)
      setColors(cs => cs.filter(c => c.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (c: RibbonPrintColorResponse, val: boolean) => {
    try {
      const updated = await updateRibbonPrintColor(c.id, { ...c, isActive: val })
      setColors(cs => cs.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    {
      title: '',
      key: 'swatch',
      width: 48,
      render: (_: unknown, c: RibbonPrintColorResponse) => (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: c.hex,
          border: '1px solid #e5e7eb', display: 'inline-block',
        }} />
      ),
    },
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, c: RibbonPrintColorResponse) => (
        <Space>
          <strong>{c.name}</strong>
          <Tag color="purple" style={{ fontSize: 11 }}>{c.slug}</Tag>
        </Space>
      ),
    },
    {
      title: 'HEX',
      dataIndex: 'hex',
      key: 'hex',
      render: (hex: string) => <code style={{ fontSize: 12 }}>{hex}</code>,
    },
    {
      title: 'Використання',
      key: 'usage',
      render: (_: unknown, c: RibbonPrintColorResponse) => (
        <Space direction="vertical" size={4}>
          <Space size={6}>
            <Switch
              size="small"
              checked={c.isForMainText}
              onChange={async val => {
                try {
                  const updated = await updateRibbonPrintColor(c.id, { ...c, isForMainText: val })
                  setColors(cs => cs.map(x => x.id === updated.id ? updated : x))
                } catch { message.error('Помилка') }
              }}
            />
            <span style={{ fontSize: 12 }}>Основний напис</span>
          </Space>
          <Space size={6}>
            <Switch
              size="small"
              checked={c.isForExtraText}
              onChange={async val => {
                try {
                  const updated = await updateRibbonPrintColor(c.id, { ...c, isForExtraText: val })
                  setColors(cs => cs.map(x => x.id === updated.id ? updated : x))
                } catch { message.error('Помилка') }
              }}
            />
            <span style={{ fontSize: 12 }}>Додатковий напис</span>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Надбавка',
      dataIndex: 'priceModifier',
      key: 'priceModifier',
      render: (v: number) => v > 0
        ? <Tag color="orange">+{v} ₴</Tag>
        : <span style={{ color: '#d9d9d9' }}>—</span>,
    },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, c: RibbonPrintColorResponse) => (
        <Switch checked={c.isActive} onChange={val => handleToggle(c, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, c: RibbonPrintColorResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(c)} />
          <Popconfirm
            title="Видалити колір друку?"
            onConfirm={() => handleDelete(c.id)}
            okText="Так" cancelText="Ні"
          >
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <FormatPainterOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Кольори друку</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Кольори нанесення тексту у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={colors}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати колір друку' : 'Новий колір друку'}
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

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="gold" />
          </Form.Item>

          <Form.Item label="Колір">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Form.Item name="hex" noStyle rules={[{ required: true }]}>
                <Input style={{ flex: 1 }} placeholder="#c9a84c" onChange={e => form.setFieldValue('hex', e.target.value)} />
              </Form.Item>
              <input
                type="color"
                value={hexWatch || '#000000'}
                style={{ width: 40, height: 32, border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                onChange={e => form.setFieldValue('hex', e.target.value)}
              />
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: hexWatch || '#000',
                border: '1px solid #e5e7eb',
              }} />
            </div>
          </Form.Item>

          <Form.Item name="isForMainText" label="Основний напис" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="isForExtraText" label="Додатковий напис" valuePropName="checked">
            <Switch />
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
