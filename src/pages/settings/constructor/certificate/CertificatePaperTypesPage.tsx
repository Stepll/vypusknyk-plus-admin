import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getCertificatePaperTypes, createCertificatePaperType,
  updateCertificatePaperType, deleteCertificatePaperType,
} from '../../../../api/certificatePaperTypes'
import type { CertificatePaperTypeResponse, SaveCertificatePaperTypeRequest } from '../../../../api/types'

const EMPTY: SaveCertificatePaperTypeRequest = { name: '', slug: '', priceModifier: 0, isActive: true, sortOrder: 0 }

export default function CertificatePaperTypesPage() {
  const [items, setItems]           = useState<CertificatePaperTypeResponse[]>([])
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState<CertificatePaperTypeResponse | null>(null)
  const [saving, setSaving]         = useState(false)
  const [form] = Form.useForm<SaveCertificatePaperTypeRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCertificatePaperTypes()
      setItems(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити типи паперу')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); form.setFieldsValue(EMPTY); setDrawerOpen(true) }
  const openEdit = (t: CertificatePaperTypeResponse) => { setEditing(t); form.setFieldsValue(t); setDrawerOpen(true) }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateCertificatePaperType(editing.id, vals)
        setItems(xs => xs.map(x => x.id === updated.id ? updated : x))
      } else {
        const created = await createCertificatePaperType(vals)
        setItems(xs => [...xs, created])
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
      await deleteCertificatePaperType(id)
      setItems(xs => xs.filter(x => x.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (t: CertificatePaperTypeResponse, val: boolean) => {
    try {
      const updated = await updateCertificatePaperType(t.id, { ...t, isActive: val })
      setItems(xs => xs.map(x => x.id === updated.id ? updated : x))
    } catch { message.error('Помилка') }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, t: CertificatePaperTypeResponse) => (
        <Space>
          <strong>{t.name}</strong>
          <Tag color="gold" style={{ fontSize: 11 }}>{t.slug}</Tag>
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
      render: (_: unknown, t: CertificatePaperTypeResponse) => (
        <Switch checked={t.isActive} onChange={val => handleToggle(t, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, t: CertificatePaperTypeResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} />
          <Popconfirm title="Видалити тип паперу?" onConfirm={() => handleDelete(t.id)} okText="Так" cancelText="Ні">
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
            background: 'linear-gradient(135deg, #c9a84c 0%, #e5c97a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <FileTextOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Типи паперу</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Матеріали для друку грамот</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table rowKey="id" dataSource={items} columns={columns} loading={loading} pagination={false} />

      <Drawer
        title={editing ? 'Редагувати тип паперу' : 'Новий тип паперу'}
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
            <Input placeholder="Стандартний папір" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="standard" />
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
