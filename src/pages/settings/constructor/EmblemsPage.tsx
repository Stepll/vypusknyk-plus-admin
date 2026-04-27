import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Tag, Tooltip,
} from 'antd'
import { PictureOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons'
import {
  getRibbonEmblems, createRibbonEmblem, updateRibbonEmblem, deleteRibbonEmblem, uploadRibbonEmblemSvg,
} from '../../../api/ribbonEmblems'
import type { RibbonEmblemResponse, SaveRibbonEmblemRequest } from '../../../api/types'

const EMPTY: SaveRibbonEmblemRequest = {
  name: '', slug: '', isActive: true, sortOrder: 0,
}

const SVG_TOOLTIP = (
  <div style={{ maxWidth: 260 }}>
    <p style={{ margin: '0 0 6px' }}>
      SVG файл повинен використовувати <code>fill="currentColor"</code> замість фіксованих кольорів —
      тоді емблема автоматично приймає колір напису стрічки.
    </p>
    <p style={{ margin: 0 }}>
      <strong>Figma:</strong> виділи форму → Fill → змінити на <code>currentColor</code> → Export as SVG.
    </p>
  </div>
)

export default function EmblemsPage() {
  const [emblems, setEmblems] = useState<RibbonEmblemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<RibbonEmblemResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const [form] = Form.useForm<SaveRibbonEmblemRequest>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingIdRef = useRef<number | null>(null)

  const load = () => {
    setLoading(true)
    getRibbonEmblems()
      .then(setEmblems)
      .catch(() => message.error('Не вдалося завантажити емблеми'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(EMPTY)
    setDrawerOpen(true)
  }

  const openEdit = (e: RibbonEmblemResponse) => {
    setEditing(e)
    form.setFieldsValue(e)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateRibbonEmblem(editing.id, vals)
        setEmblems(es => es.map(e => e.id === updated.id ? updated : e))
      } else {
        const created = await createRibbonEmblem(vals)
        setEmblems(es => [...es, created])
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
      await deleteRibbonEmblem(id)
      setEmblems(es => es.filter(e => e.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (e: RibbonEmblemResponse, val: boolean) => {
    try {
      const updated = await updateRibbonEmblem(e.id, { ...e, isActive: val })
      setEmblems(es => es.map(x => x.id === updated.id ? updated : x))
    } catch {
      message.error('Помилка')
    }
  }

  const triggerUpload = (id: number) => {
    uploadingIdRef.current = id
    fileInputRef.current?.click()
  }

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    const id = uploadingIdRef.current
    if (!file || !id) return
    ev.target.value = ''

    setUploading(id)
    try {
      const updated = await uploadRibbonEmblemSvg(id, file)
      setEmblems(es => es.map(x => x.id === updated.id ? updated : x))
      message.success('SVG завантажено')
    } catch {
      message.error('Помилка завантаження SVG')
    } finally {
      setUploading(null)
      uploadingIdRef.current = null
    }
  }

  const columns = [
    {
      title: 'Превью',
      key: 'preview',
      width: 64,
      render: (_: unknown, e: RibbonEmblemResponse) => (
        <div style={{
          width: 48, height: 48, borderRadius: 8, border: '1px solid #f0f0f0',
          background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {e.svgUrl
            ? <img src={e.svgUrl} alt={e.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            : <PictureOutlined style={{ color: '#555', fontSize: 20 }} />
          }
        </div>
      ),
    },
    {
      title: 'Назва',
      key: 'name',
      render: (_: unknown, e: RibbonEmblemResponse) => (
        <Space>
          <strong>{e.name}</strong>
          <Tag color="purple" style={{ fontSize: 11 }}>{e.slug}</Tag>
        </Space>
      ),
    },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, e: RibbonEmblemResponse) => (
        <Switch checked={e.isActive} onChange={val => handleToggle(e, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_: unknown, e: RibbonEmblemResponse) => (
        <Space>
          <Tooltip title={SVG_TOOLTIP} placement="left" overlayStyle={{ maxWidth: 300 }}>
            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={uploading === e.id}
              onClick={() => triggerUpload(e.id)}
            >
              SVG
            </Button>
          </Tooltip>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(e)} />
          <Popconfirm
            title="Видалити емблему?"
            onConfirm={() => handleDelete(e.id)}
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PictureOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Емблеми</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
              Значки на стрічці у конструкторі
              <Tooltip title={SVG_TOOLTIP} placement="right" overlayStyle={{ maxWidth: 300 }}>
                <InfoCircleOutlined style={{ marginLeft: 6, color: '#8c8c8c', cursor: 'help' }} />
              </Tooltip>
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={emblems}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати емблему' : 'Нова емблема'}
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
            <Input placeholder="Дзвіночок" />
          </Form.Item>

          <Form.Item name="slug" label="Slug (значення в коді)" rules={[{ required: true, message: 'Обовʼязково' }]}>
            <Input placeholder="bell" />
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
