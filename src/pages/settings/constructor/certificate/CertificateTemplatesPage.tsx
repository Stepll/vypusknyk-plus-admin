import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Divider,
} from 'antd'
import { PictureOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getCertificateTemplates, createCertificateTemplate, updateCertificateTemplate,
  deleteCertificateTemplate, uploadCertificateTemplateImage,
} from '../../../../api/certificateTemplates'
import type { CertificateTemplateResponse, SaveCertificateTemplateRequest } from '../../../../api/types'

const EMPTY: SaveCertificateTemplateRequest = { name: '', slug: '', priceModifier: 0, isActive: true, sortOrder: 0 }

function TemplatePreview({ url }: { url: string | null }) {
  return (
    <div style={{
      width: 80, height: 56, borderRadius: 6, border: '1px solid #e8e8e8',
      background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {url
        ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <PictureOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />
      }
    </div>
  )
}

export default function CertificateTemplatesPage() {
  const [items, setItems]           = useState<CertificateTemplateResponse[]>([])
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState<CertificateTemplateResponse | null>(null)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [form] = Form.useForm<SaveCertificateTemplateRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCertificateTemplates()
      setItems(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити шаблони')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); form.setFieldsValue(EMPTY); setDrawerOpen(true) }
  const openEdit = (t: CertificateTemplateResponse) => { setEditing(t); form.setFieldsValue(t); setDrawerOpen(true) }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateCertificateTemplate(editing.id, vals)
        setItems(xs => xs.map(x => x.id === updated.id ? updated : x))
        setEditing(updated)
      } else {
        const created = await createCertificateTemplate(vals)
        setItems(xs => [...xs, created])
        setEditing(created)
      }
      message.success('Збережено')
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCertificateTemplate(id)
      setItems(xs => xs.filter(x => x.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (t: CertificateTemplateResponse, val: boolean) => {
    try {
      const updated = await updateCertificateTemplate(t.id, { ...t, isActive: val })
      setItems(xs => xs.map(x => x.id === updated.id ? updated : x))
    } catch { message.error('Помилка') }
  }

  const handleUpload = async (file: File) => {
    if (!editing) return
    setUploading(true)
    try {
      const updated = await uploadCertificateTemplateImage(editing.id, file)
      setItems(xs => xs.map(x => x.id === updated.id ? updated : x))
      setEditing(updated)
      message.success('Зображення завантажено')
    } catch {
      message.error('Помилка завантаження')
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Превью',
      key: 'preview',
      width: 100,
      render: (_: unknown, t: CertificateTemplateResponse) => <TemplatePreview url={t.imageUrl} />,
    },
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, t: CertificateTemplateResponse) => (
        <Space direction="vertical" size={0}>
          <strong>{t.name}</strong>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{t.slug}</span>
        </Space>
      ),
    },
    {
      title: 'Надбавка',
      dataIndex: 'priceModifier',
      key: 'priceModifier',
      render: (v: number) => v > 0
        ? <span style={{ color: '#c9a84c', fontWeight: 600 }}>+{v} ₴</span>
        : <span style={{ color: '#d9d9d9' }}>—</span>,
    },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, t: CertificateTemplateResponse) => (
        <Switch checked={t.isActive} onChange={val => handleToggle(t, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, t: CertificateTemplateResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} />
          <Popconfirm title="Видалити шаблон?" onConfirm={() => handleDelete(t.id)} okText="Так" cancelText="Ні">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={ev => {
          const f = ev.target.files?.[0]
          if (f) handleUpload(f)
          ev.target.value = ''
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #c9a84c 0%, #e5c97a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PictureOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Шаблони грамот</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>PNG-накладки для конструктора грамот</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table rowKey="id" dataSource={items} columns={columns} loading={loading} pagination={false} />

      <Drawer
        title={editing ? 'Редагувати шаблон' : 'Новий шаблон'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setDrawerOpen(false)}>Закрити</Button>
            <Button type="primary" loading={saving} onClick={handleSave}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="Класична рамка" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="classic" />
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

        {editing && (
          <>
            <Divider />
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Зображення шаблону</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <TemplatePreview url={editing.imageUrl} />
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {editing.imageUrl ? 'Замінити' : 'Завантажити'}
              </Button>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>JPG, PNG, WebP · до 10 МБ</p>
          </>
        )}
      </Drawer>
    </div>
  )
}
