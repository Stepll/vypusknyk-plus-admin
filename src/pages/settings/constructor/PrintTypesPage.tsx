import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { PrinterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getRibbonPrintTypes, createRibbonPrintType, updateRibbonPrintType, deleteRibbonPrintType,
} from '../../../api/ribbonPrintTypes'
import type { RibbonPrintTypeResponse, SaveRibbonPrintTypeRequest } from '../../../api/types'

const EMPTY: SaveRibbonPrintTypeRequest = {
  name: '', slug: '', priceModifier: 0, isActive: true, sortOrder: 0,
}

export default function PrintTypesPage() {
  const [types, setTypes] = useState<RibbonPrintTypeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonPrintTypeResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveRibbonPrintTypeRequest>()

  const load = () => {
    setLoading(true)
    getRibbonPrintTypes()
      .then(setTypes)
      .catch(() => message.error('Не вдалося завантажити типи друку'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (t: RibbonPrintTypeResponse) => {
    setEditing(t)
    form.setFieldsValue(t)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonPrintType(editing.id, vals)
        setTypes(ts => ts.map(t => t.id === updated.id ? updated : t))
      } else {
        const created = await createRibbonPrintType(vals)
        setTypes(ts => [...ts, created])
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
      await deleteRibbonPrintType(id)
      setTypes(ts => ts.filter(t => t.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (t: RibbonPrintTypeResponse, val: boolean) => {
    try {
      const updated = await updateRibbonPrintType(t.id, { ...t, isActive: val })
      setTypes(ts => ts.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, t: RibbonPrintTypeResponse) => (
        <Space>
          <strong>{t.name}</strong>
          <Tag color="blue" style={{ fontSize: 11 }}>{t.slug}</Tag>
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
      render: (_: unknown, t: RibbonPrintTypeResponse) => (
        <Switch checked={t.isActive} onChange={val => handleToggle(t, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, t: RibbonPrintTypeResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} />
          <Popconfirm
            title="Видалити тип друку?"
            onConfirm={() => handleDelete(t.id)}
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
            background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PrinterOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Типи друку</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Способи нанесення у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={types}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати тип друку' : 'Новий тип друку'}
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
            <Input placeholder="Фольга" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="foil" />
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
