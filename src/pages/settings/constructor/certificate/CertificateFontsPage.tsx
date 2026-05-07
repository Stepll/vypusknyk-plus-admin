import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag,
} from 'antd'
import { FontSizeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getCertificateFonts, createCertificateFont, updateCertificateFont, deleteCertificateFont,
} from '../../../../api/certificateFonts'
import type { CertificateFontResponse, SaveCertificateFontRequest } from '../../../../api/types'

const EMPTY: SaveCertificateFontRequest = {
  name: '', slug: '', fontFamily: '', priceModifier: 0, isActive: true, sortOrder: 0,
}

export default function CertificateFontsPage() {
  const [fonts, setFonts]           = useState<CertificateFontResponse[]>([])
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState<CertificateFontResponse | null>(null)
  const [saving, setSaving]         = useState(false)
  const [form] = Form.useForm<SaveCertificateFontRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCertificateFonts()
      setFonts(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити шрифти')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); form.setFieldsValue(EMPTY); setDrawerOpen(true) }
  const openEdit = (f: CertificateFontResponse) => { setEditing(f); form.setFieldsValue(f); setDrawerOpen(true) }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateCertificateFont(editing.id, vals)
        setFonts(fs => fs.map(f => f.id === updated.id ? updated : f))
      } else {
        const created = await createCertificateFont(vals)
        setFonts(fs => [...fs, created])
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
      await deleteCertificateFont(id)
      setFonts(fs => fs.filter(f => f.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (f: CertificateFontResponse, val: boolean) => {
    try {
      const updated = await updateCertificateFont(f.id, { ...f, isActive: val })
      setFonts(fs => fs.map(x => x.id === updated.id ? updated : x))
    } catch { message.error('Помилка') }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Превью',
      key: 'preview',
      width: 80,
      render: (_: unknown, f: CertificateFontResponse) => (
        <span style={{ fontFamily: f.fontFamily, fontSize: 20, fontWeight: 700 }}>Аб</span>
      ),
    },
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, f: CertificateFontResponse) => (
        <Space>
          <strong>{f.name}</strong>
          <Tag color="gold" style={{ fontSize: 11 }}>{f.slug}</Tag>
        </Space>
      ),
    },
    {
      title: 'Font family',
      dataIndex: 'fontFamily',
      key: 'fontFamily',
      render: (v: string) => <span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span>,
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
      render: (_: unknown, f: CertificateFontResponse) => (
        <Switch checked={f.isActive} onChange={val => handleToggle(f, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, f: CertificateFontResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(f)} />
          <Popconfirm title="Видалити шрифт?" onConfirm={() => handleDelete(f.id)} okText="Так" cancelText="Ні">
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
            <FontSizeOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Шрифти грамот</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Шрифти тексту в конструкторі грамот</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table rowKey="id" dataSource={fonts} columns={columns} loading={loading} pagination={false} />

      <Drawer
        title={editing ? 'Редагувати шрифт' : 'Новий шрифт'}
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
            <Input placeholder="Класичний" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="classic" />
          </Form.Item>
          <Form.Item name="fontFamily" label="Font family (CSS)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="Arial, sans-serif" />
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
