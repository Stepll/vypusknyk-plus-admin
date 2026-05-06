import { useEffect, useRef, useState } from 'react'
import {
  Table, Switch, Button, Drawer, Form, Input, InputNumber,
  Popconfirm, message, Space, Divider,
} from 'antd'
import { PictureOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import {
  getBadgeImages, createBadgeImage, updateBadgeImage, deleteBadgeImage, uploadBadgeImage,
} from '../../../../api/badgeImages'
import type { BadgeImageResponse, SaveBadgeImageRequest } from '../../../../api/types'

const EMPTY: SaveBadgeImageRequest = { name: '', isActive: true, sortOrder: 0 }

function ImagePreview({ url }: { url: string | null }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%', border: '1px solid #e8e8e8',
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

export default function BadgeImagesPage() {
  const [images, setImages]       = useState<BadgeImageResponse[]>([])
  const [loading, setLoading]     = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]     = useState<BadgeImageResponse | null>(null)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm<SaveBadgeImageRequest>()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialOpenId = useRef(searchParams.get('openId'))
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getBadgeImages()
      setImages(data)
      if (initialOpenId.current) {
        const item = data.find(i => i.id === Number(initialOpenId.current))
        if (item) openEdit(item)
        initialOpenId.current = null
        setSearchParams({}, { replace: true })
      }
    } catch {
      message.error('Не вдалося завантажити картинки')
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

  const openEdit = (img: BadgeImageResponse) => {
    setEditing(img)
    form.setFieldsValue(img)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    const vals = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateBadgeImage(editing.id, vals)
        setImages(imgs => imgs.map(i => i.id === updated.id ? updated : i))
        setEditing(updated)
      } else {
        const created = await createBadgeImage(vals)
        setImages(imgs => [...imgs, created])
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
      await deleteBadgeImage(id)
      setImages(imgs => imgs.filter(i => i.id !== id))
      message.success('Видалено')
    } catch {
      message.error('Помилка видалення')
    }
  }

  const handleToggle = async (img: BadgeImageResponse, val: boolean) => {
    try {
      const updated = await updateBadgeImage(img.id, { name: img.name, isActive: val, sortOrder: img.sortOrder })
      setImages(imgs => imgs.map(i => i.id === updated.id ? updated : i))
    } catch {
      message.error('Помилка')
    }
  }

  const handleUpload = async (file: File) => {
    if (!editing) return
    setUploading(true)
    try {
      const updated = await uploadBadgeImage(editing.id, file)
      setImages(imgs => imgs.map(i => i.id === updated.id ? updated : i))
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
      title: 'Зображення',
      key: 'preview',
      width: 80,
      render: (_: unknown, img: BadgeImageResponse) => <ImagePreview url={img.imageUrl} />,
    },
    { title: 'Назва', dataIndex: 'name', key: 'name', render: (v: string) => <strong>{v}</strong> },
    {
      title: 'Активний',
      key: 'isActive',
      render: (_: unknown, img: BadgeImageResponse) => (
        <Switch checked={img.isActive} onChange={val => handleToggle(img, val)} />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, img: BadgeImageResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(img)} />
          <Popconfirm
            title="Видалити картинку?"
            onConfirm={() => handleDelete(img.id)}
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
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <PictureOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Готові картинки</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Пресети фону для значків у конструкторі</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={images}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editing ? 'Редагувати картинку' : 'Нова картинка'}
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
            <Input placeholder="Наприклад: Шкільний клас" />
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
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Зображення</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ImagePreview url={editing.imageUrl} />
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
