import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form, Input, InputNumber, Select, Switch, Button, Card,
  Row, Col, Tag, Image, Upload, message, Popconfirm, Spin,
} from 'antd'
import {
  AppstoreOutlined, ArrowLeftOutlined, SaveOutlined,
  DeleteOutlined, PlusOutlined, UploadOutlined,
} from '@ant-design/icons'
import {
  getAdminProduct, createAdminProduct, updateAdminProduct, uploadProductImage,
} from '../../api/adminProducts'
import { productsStore } from '../../stores/ProductsStore'
import type { SaveProductRequest } from '../../api/types'

const CATEGORY_OPTIONS = [
  { value: 'Ribbon', label: 'Стрічки' },
  { value: 'Medal', label: 'Медалі' },
  { value: 'Certificate', label: 'Грамоти' },
  { value: 'Accessory', label: 'Аксесуари' },
]

const COLOR_OPTIONS = [
  { value: 'coral', label: 'Корал' },
  { value: 'blue-yellow', label: 'Синьо-жовтий' },
  { value: 'white', label: 'Білий' },
  { value: 'gold', label: 'Золотий' },
  { value: 'red', label: 'Червоний' },
  { value: 'green', label: 'Зелений' },
  { value: 'purple', label: 'Фіолетовий' },
  { value: 'black', label: 'Чорний' },
]

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [savedId, setSavedId] = useState<number | null>(null)

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    getAdminProduct(Number(id))
      .then(p => {
        form.setFieldsValue({
          name: p.name,
          description: p.description,
          price: p.price,
          minOrder: p.minOrder,
          category: p.category,
          color: p.color ?? undefined,
          popular: p.popular,
          isNew: p.isNew,
          isDeleted: p.isDeleted,
        })
        setTags(p.tags)
        setImageUrl(p.imageUrl)
        setSavedId(p.id)
      })
      .catch(() => { message.error('Не вдалося завантажити продукт'); navigate('/products') })
      .finally(() => setLoading(false))
  }, [id, isNew, form, navigate])

  const handleSave = async () => {
    const values = await form.validateFields()
    const request: SaveProductRequest = {
      name: values.name,
      description: values.description ?? '',
      price: values.price,
      minOrder: values.minOrder,
      category: values.category,
      color: values.color ?? null,
      tags,
      popular: values.popular ?? false,
      isNew: values.isNew ?? false,
      isDeleted: values.isDeleted ?? false,
    }

    setSaving(true)
    try {
      if (isNew) {
        const created = await createAdminProduct(request)
        message.success('Продукт створено')
        productsStore.fetchProducts()
        navigate(`/products/${created.id}`, { replace: true })
      } else {
        await updateAdminProduct(Number(id), request)
        message.success('Збережено')
        productsStore.fetchProducts()
      }
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (options: { file: string | Blob | File }) => {
    const productId = savedId ?? (isNew ? null : Number(id))
    if (!productId) {
      message.warning('Спочатку збережіть продукт')
      return
    }
    setImageUploading(true)
    try {
      const result = await uploadProductImage(productId, options.file as File)
      setImageUrl(result.imageUrl)
      message.success('Зображення завантажено')
    } catch {
      message.error('Помилка завантаження зображення')
    } finally {
      setImageUploading(false)
    }
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleDelete = async () => {
    try {
      await updateAdminProduct(Number(id), {
        ...form.getFieldsValue(),
        tags,
        color: form.getFieldValue('color') ?? null,
        isDeleted: true,
      })
      message.success('Продукт видалено')
      productsStore.fetchProducts()
      navigate('/products')
    } catch {
      message.error('Помилка видалення')
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/products')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <AppstoreOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              {isNew ? 'Новий продукт' : 'Редагування продукту'}
            </h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
              {isNew ? 'Заповніть дані нового товару' : `ID: ${id}`}
            </p>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{ minOrder: 1, popular: false, isNew: false, isDeleted: false }}>
        <Row gutter={24} align="top">

          {/* Left column — main form */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item label="Назва" name="name" rules={[{ required: true, message: 'Введіть назву' }]}>
                <Input size="large" placeholder="Стрічка «Золотий випускник»" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Категорія" name="category" rules={[{ required: true, message: 'Виберіть категорію' }]}>
                    <Select size="large" options={CATEGORY_OPTIONS} placeholder="Виберіть категорію" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Колір" name="color">
                    <Select size="large" options={COLOR_OPTIONS} allowClear placeholder="Без кольору" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Ціна (грн)" name="price" rules={[{ required: true, message: 'Введіть ціну' }]}>
                    <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="65" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Мін. замовлення (шт)" name="minOrder" rules={[{ required: true }]}>
                    <InputNumber size="large" min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Опис" name="description">
                <Input.TextArea rows={4} placeholder="Детальний опис товару..." />
              </Form.Item>

              {/* Tags */}
              <Form.Item label="Теги">
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {tags.map(tag => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => setTags(tags.filter(t => t !== tag))}
                      style={{ fontSize: 13 }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onPressEnter={handleAddTag}
                  placeholder="Введіть тег і натисніть Enter"
                  suffix={<PlusOutlined onClick={handleAddTag} style={{ cursor: 'pointer', color: '#8c8c8c' }} />}
                  style={{ maxWidth: 320 }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Right column — image + settings + actions */}
          <Col xs={24} lg={8}>

            {/* Image */}
            <Card
              style={{ borderRadius: 12, marginBottom: 16 }}
              title={<span style={{ fontSize: 14, fontWeight: 600 }}>Зображення</span>}
            >
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                background: 'linear-gradient(135deg, #059669, #0891b2)',
                marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {imageUrl
                  ? <Image src={imageUrl} width="100%" height="100%" style={{ objectFit: 'cover' }} preview={false} />
                  : <AppstoreOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
                }
              </div>
              <Upload
                customRequest={handleUpload}
                showUploadList={false}
                accept="image/jpeg,image/png,image/webp"
              >
                <Button icon={<UploadOutlined />} block loading={imageUploading}>
                  {imageUrl ? 'Змінити фото' : 'Завантажити фото'}
                </Button>
              </Upload>
              {isNew && !savedId && (
                <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                  Спочатку збережіть продукт, потім завантажте фото
                </p>
              )}
            </Card>

            {/* Settings */}
            <Card
              style={{ borderRadius: 12, marginBottom: 16 }}
              title={<span style={{ fontSize: 14, fontWeight: 600 }}>Налаштування</span>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>Популярне</span>
                  <Form.Item name="popular" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>Новинка</span>
                  <Form.Item name="isNew" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                <Form.Item label="Статус" name="isDeleted" style={{ marginBottom: 0 }}>
                  <Select
                    options={[
                      { value: false, label: 'Активний' },
                      { value: true, label: 'Видалено' },
                    ]}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Actions */}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              block
              size="large"
              loading={saving}
              onClick={handleSave}
              style={{ marginBottom: 8, background: 'linear-gradient(135deg, #059669, #0891b2)', border: 'none' }}
            >
              {isNew ? 'Створити продукт' : 'Зберегти зміни'}
            </Button>

            {!isNew && (
              <Popconfirm
                title="Видалити продукт?"
                description="Продукт буде позначено як видалений."
                onConfirm={handleDelete}
                okText="Так"
                cancelText="Ні"
              >
                <Button danger icon={<DeleteOutlined />} block>
                  Видалити
                </Button>
              </Popconfirm>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  )
}
