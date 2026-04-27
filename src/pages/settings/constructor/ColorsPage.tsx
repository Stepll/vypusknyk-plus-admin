import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { BgColorsOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getRibbonColors, createRibbonColor, updateRibbonColor, deleteRibbonColor,
} from '../../../api/ribbonColors'
import type { RibbonColorResponse, SaveRibbonColorRequest } from '../../../api/types'

function ColorSwatch({ hex, secondaryHex }: { hex: string; secondaryHex: string | null }) {
  if (secondaryHex) {
    return (
      <div style={{
        width: 28, height: 28, borderRadius: '50%', overflow: 'hidden',
        border: '1px solid #e5e7eb', display: 'inline-block', flexShrink: 0,
      }}>
        <div style={{ width: '100%', height: '50%', background: hex }} />
        <div style={{ width: '100%', height: '50%', background: secondaryHex }} />
      </div>
    )
  }
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', background: hex,
      border: '1px solid #e5e7eb', display: 'inline-block', flexShrink: 0,
    }} />
  )
}

const EMPTY: SaveRibbonColorRequest = {
  name: '', slug: '', hex: '#000000', secondaryHex: null,
  priceModifier: 0, isActive: true, sortOrder: 0,
}

export default function ColorsPage() {
  const [colors, setColors] = useState<RibbonColorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonColorResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveRibbonColorRequest>()

  const secondaryHexWatch = Form.useWatch('secondaryHex', form)

  const load = () => {
    setLoading(true)
    getRibbonColors()
      .then(setColors)
      .catch(() => message.error('Не вдалося завантажити кольори'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (c: RibbonColorResponse) => {
    setEditing(c)
    form.setFieldsValue({
      name: c.name,
      slug: c.slug,
      hex: c.hex,
      secondaryHex: c.secondaryHex ?? null,
      priceModifier: c.priceModifier,
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    })
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    const req: SaveRibbonColorRequest = {
      ...vals,
      secondaryHex: vals.secondaryHex?.trim() || null,
    }
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonColor(editing.id, req)
        setColors(cs => cs.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await createRibbonColor(req)
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
      await deleteRibbonColor(id)
      setColors(cs => cs.filter(c => c.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (c: RibbonColorResponse, val: boolean) => {
    try {
      const updated = await updateRibbonColor(c.id, { ...c, secondaryHex: c.secondaryHex, isActive: val })
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
      render: (_: unknown, c: RibbonColorResponse) => (
        <ColorSwatch hex={c.hex} secondaryHex={c.secondaryHex} />
      ),
    },
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, c: RibbonColorResponse) => (
        <Space>
          <strong>{name}</strong>
          <Tag color="purple" style={{ fontSize: 11 }}>{c.slug}</Tag>
        </Space>
      ),
    },
    {
      title: 'Основний колір',
      dataIndex: 'hex',
      key: 'hex',
      render: (hex: string) => <code style={{ fontSize: 12 }}>{hex}</code>,
    },
    {
      title: 'Нижній колір',
      dataIndex: 'secondaryHex',
      key: 'secondaryHex',
      render: (v: string | null) => v
        ? <code style={{ fontSize: 12 }}>{v}</code>
        : <span style={{ color: '#d9d9d9' }}>—</span>,
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
      render: (_: unknown, c: RibbonColorResponse) => (
        <Switch checked={c.isActive} onChange={val => handleToggle(c, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, c: RibbonColorResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(c)} />
          <Popconfirm
            title="Видалити колір?"
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
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <BgColorsOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Кольори</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Кольори стрічок у конструкторі</p>
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
        title={editing ? 'Редагувати колір' : 'Новий колір'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={440}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="Синьо-жовтий" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="blue-yellow" />
          </Form.Item>

          <Form.Item label="Основний колір" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Form.Item name="hex" noStyle rules={[{ required: true }]}>
                <Input style={{ flex: 1 }} placeholder="#1a56a0" />
              </Form.Item>
              <Form.Item name="hex" noStyle>
                <input
                  type="color"
                  style={{ width: 40, height: 32, border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                  onChange={e => form.setFieldValue('hex', e.target.value)}
                />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            name="secondaryHex"
            label="Нижній колір (для двоколірних, напр. синьо-жовтий)"
            style={{ marginTop: 16 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                value={secondaryHexWatch ?? ''}
                placeholder="#FFD700 (залиш порожнім якщо одноколірний)"
                onChange={e => form.setFieldValue('secondaryHex', e.target.value || null)}
                style={{ flex: 1 }}
              />
              <input
                type="color"
                value={secondaryHexWatch || '#ffffff'}
                style={{ width: 40, height: 32, border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                onChange={e => form.setFieldValue('secondaryHex', e.target.value)}
              />
            </div>
          </Form.Item>

          {(form.getFieldValue('hex') || form.getFieldValue('secondaryHex')) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>Превью:</span>
              <ColorSwatch hex={form.getFieldValue('hex') || '#000'} secondaryHex={form.getFieldValue('secondaryHex')} />
            </div>
          )}

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
