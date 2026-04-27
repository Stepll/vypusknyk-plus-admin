import { useEffect, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { ExperimentOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getRibbonMaterials, createRibbonMaterial, updateRibbonMaterial, deleteRibbonMaterial,
} from '../../../api/ribbonMaterials'
import type { RibbonMaterialResponse, SaveRibbonMaterialRequest } from '../../../api/types'

const EMPTY: SaveRibbonMaterialRequest = {
  name: '', slug: '', priceModifier: 0, isActive: true, sortOrder: 0,
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<RibbonMaterialResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonMaterialResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<SaveRibbonMaterialRequest>()

  const load = () => {
    setLoading(true)
    getRibbonMaterials()
      .then(setMaterials)
      .catch(() => message.error('Не вдалося завантажити матеріали'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (m: RibbonMaterialResponse) => {
    setEditing(m)
    form.setFieldsValue(m)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonMaterial(editing.id, vals)
        setMaterials(ms => ms.map(m => m.id === updated.id ? updated : m))
      } else {
        const created = await createRibbonMaterial(vals)
        setMaterials(ms => [...ms, created])
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
      await deleteRibbonMaterial(id)
      setMaterials(ms => ms.filter(m => m.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (m: RibbonMaterialResponse, val: boolean) => {
    try {
      const updated = await updateRibbonMaterial(m.id, { ...m, isActive: val })
      setMaterials(ms => ms.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const columns = [
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, m: RibbonMaterialResponse) => (
        <Space>
          <strong>{m.name}</strong>
          <Tag color="purple" style={{ fontSize: 11 }}>{m.slug}</Tag>
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
      render: (_: unknown, m: RibbonMaterialResponse) => (
        <Switch checked={m.isActive} onChange={val => handleToggle(m, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, m: RibbonMaterialResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(m)} />
          <Popconfirm
            title="Видалити матеріал?"
            onConfirm={() => handleDelete(m.id)}
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
            <ExperimentOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Матеріали</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Матеріали стрічок у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={materials}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати матеріал' : 'Новий матеріал'}
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
            <Input placeholder="Атлас" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="atlas" />
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
