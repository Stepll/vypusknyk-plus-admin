import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { AppstoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getBadgeSizes, createBadgeSize, updateBadgeSize, deleteBadgeSize,
} from '../../../../api/badgeSizes'
import type { BadgeSizeResponse, SaveBadgeSizeRequest } from '../../../../api/types'

const EMPTY: SaveBadgeSizeRequest = {
  name: '', diameter: 25, priceModifier: 0, isActive: true, sortOrder: 0,
}

export default function BadgeSizesPage() {
  const [sizes, setSizes] = useState<BadgeSizeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<BadgeSizeResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveBadgeSizeRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const data = await getBadgeSizes()
      setSizes(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити розміри')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (s: BadgeSizeResponse) => {
    setEditing(s)
    form.setFieldsValue(s)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateBadgeSize(editing.id, vals)
        setSizes(ss => ss.map(s => s.id === updated.id ? updated : s))
      } else {
        const created = await createBadgeSize(vals)
        setSizes(ss => [...ss, created])
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
      await deleteBadgeSize(id)
      setSizes(ss => ss.filter(s => s.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (s: BadgeSizeResponse, val: boolean) => {
    try {
      const updated = await updateBadgeSize(s.id, { ...s, isActive: val })
      setSizes(ss => ss.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Назва', dataIndex: 'name', key: 'name', render: (v: string) => <strong>{v}</strong> },
    {
      title: 'Діаметр (мм)',
      dataIndex: 'diameter',
      key: 'diameter',
      render: (v: number) => <Tag color="blue">{v} мм</Tag>,
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
      render: (_: unknown, s: BadgeSizeResponse) => (
        <Switch checked={s.isActive} onChange={val => handleToggle(s, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, s: BadgeSizeResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(s)} />
          <Popconfirm
            title="Видалити розмір?"
            onConfirm={() => handleDelete(s.id)}
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <AppstoreOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Розміри значків</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Доступні розміри значків у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={sizes}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати розмір' : 'Новий розмір'}
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
            <Input placeholder="25 мм" />
          </Form.Item>

          <Form.Item name="diameter" label="Діаметр (мм)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="25" />
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
