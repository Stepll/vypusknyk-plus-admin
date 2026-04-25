import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Form, Input, InputNumber, Select, Switch, Button, Card,
  Row, Col, Tag, Image, Upload, message, Popconfirm, Spin,
} from 'antd'
import {
  AppstoreOutlined, ArrowLeftOutlined, SaveOutlined,
  DeleteOutlined, PlusOutlined,
} from '@ant-design/icons'
import {
  getAdminProduct, createAdminProduct, updateAdminProduct,
  uploadProductImage, deleteProductImage, setPreviewImage,
} from '../../api/adminProducts'
import { getProductCategories } from '../../api/productCategories'
import { productsStore } from '../../stores/ProductsStore'
import type { ProductCategoryResponse, ProductImageItem, SaveProductRequest } from '../../api/types'

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
  const [images, setImages] = useState<ProductImageItem[]>([])
  const [imageUploading, setImageUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [savedId, setSavedId] = useState<number | null>(null)
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  useEffect(() => {
    getProductCategories().then(setCategories).catch(() => {})
  }, [])

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
          categoryId: p.categoryId,
          subcategoryId: p.subcategoryId ?? undefined,
          color: p.color ?? undefined,
          popular: p.popular,
          isNew: p.isNew,
          isDeleted: p.isDeleted,
        })
        setSelectedCategoryId(p.categoryId)
        setTags(p.tags)
        setImages(p.images ?? [])
        setSavedId(p.id)
      })
      .catch(() => { message.error('Не вдалося завантажити продукт'); navigate('/products') })
      .finally(() => setLoading(false))
  }, [id, isNew, form, navigate])

  const subcategoryOptions = categories
    .find(c => c.id === selectedCategoryId)
    ?.subcategories.map(s => ({ value: s.id, label: s.name })) ?? []

  const handleCategoryChange = (val: number) => {
    setSelectedCategoryId(val)
    form.setFieldValue('subcategoryId', undefined)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const request: SaveProductRequest = {
      name: values.name,
      description: values.description ?? '',
      price: values.price,
      minOrder: values.minOrder,
      categoryId: values.categoryId,
      subcategoryId: values.subcategoryId ?? null,
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
      setImages(result.images ?? [])
      message.success('Зображення завантажено')
    } catch {
      message.error('Помилка завантаження зображення')
    } finally {
      setImageUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    const productId = savedId ?? Number(id)
    try {
      const result = await deleteProductImage(productId, imageId)
      setImages(result.images ?? [])
      message.success('Зображення видалено')
    } catch {
      message.error('Помилка видалення зображення')
    }
  }

  const handleSetPreview = async (imageId: number) => {
    const productId = savedId ?? Number(id)
    try {
      const result = await setPreviewImage(productId, imageId)
      setImages(result.images ?? [])
    } catch {
      message.error('Помилка зміни превʼю')
    }
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleDelete = async () => {
    const values = form.getFieldsValue()
    try {
      await updateAdminProduct(Number(id), {
        name: values.name,
        description: values.description ?? '',
        price: values.price,
        minOrder: values.minOrder,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId ?? null,
        color: values.color ?? null,
        tags,
        popular: values.popular ?? false,
        isNew: values.isNew ?? false,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
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
        <div style={{ display: 'flex', gap: 8 }}>
          {!isNew && (
            <Popconfirm
              title="Видалити продукт?"
              description="Продукт буде позначено як видалений."
              onConfirm={handleDelete}
              okText="Так"
              cancelText="Ні"
            >
              <Button danger icon={<DeleteOutlined />}>Видалити</Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', border: 'none' }}
          >
            {isNew ? 'Створити продукт' : 'Зберегти зміни'}
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{ minOrder: 1, popular: false, isNew: false, isDeleted: false }}>
        <Row gutter={24} align="top">

          {/* Left column — main form + settings */}
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12, marginBottom: 16 }}>
              <Form.Item label="Назва" name="name" rules={[{ required: true, message: 'Введіть назву' }]}>
                <Input size="large" placeholder="Стрічка «Золотий випускник»" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Категорія" name="categoryId" rules={[{ required: true, message: 'Виберіть категорію' }]}>
                    <Select
                      size="large"
                      placeholder="Виберіть категорію"
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                      onChange={handleCategoryChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Підкатегорія" name="subcategoryId">
                    <Select
                      size="large"
                      placeholder="Без підкатегорії"
                      options={subcategoryOptions}
                      allowClear
                      disabled={!selectedCategoryId || subcategoryOptions.length === 0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Колір" name="color">
                    <Select size="large" options={COLOR_OPTIONS} allowClear placeholder="Без кольору" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Ціна (грн)" name="price" rules={[{ required: true, message: 'Введіть ціну' }]}>
                    <InputNumber size="large" min={0} style={{ width: '100%' }} placeholder="65" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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

            {/* Settings */}
            <Card
              style={{ borderRadius: 12 }}
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
          </Col>

          {/* Right column — images */}
          <Col xs={24} lg={8}>
            {(() => {
              const previewImage = images.find(i => i.isPreview) ?? null
              const canUpload = !isNew || !!savedId
              return (
                <Card
                  style={{ borderRadius: 12 }}
                  title={<span style={{ fontSize: 14, fontWeight: 600 }}>Зображення</span>}
                  extra={
                    <Upload
                      customRequest={handleUpload}
                      showUploadList={false}
                      accept="image/jpeg,image/png,image/webp"
                      disabled={!canUpload}
                    >
                      <Button
                        icon={<PlusOutlined />}
                        size="small"
                        loading={imageUploading}
                        disabled={!canUpload}
                      >
                        Додати фото
                      </Button>
                    </Upload>
                  }
                >
                  {/* Preview */}
                  <div style={{
                    width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                    background: 'linear-gradient(135deg, #059669, #0891b2)',
                    marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {previewImage
                      ? <Image src={previewImage.imageUrl} width="100%" height="100%" style={{ objectFit: 'cover' }} preview={false} />
                      : <AppstoreOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
                    }
                  </div>

                  {/* Image list */}
                  {images.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {images.map(img => (
                        <div key={img.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 8px', borderRadius: 8,
                          border: img.isPreview ? '1.5px solid #059669' : '1px solid #f0f0f0',
                          background: img.isPreview ? '#f0fdf4' : '#fafafa',
                        }}>
                          <img
                            src={img.imageUrl}
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {img.isPreview && (
                              <Tag color="green" style={{ fontSize: 11, lineHeight: '18px' }}>Превʼю</Tag>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {!img.isPreview && (
                              <Button size="small" onClick={() => handleSetPreview(img.id)}>
                                Превʼю
                              </Button>
                            )}
                            <Popconfirm
                              title="Видалити фото?"
                              onConfirm={() => handleDeleteImage(img.id)}
                              okText="Так"
                              cancelText="Ні"
                            >
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!canUpload && (
                    <p style={{ color: '#8c8c8c', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                      Спочатку збережіть продукт, потім завантажте фото
                    </p>
                  )}
                </Card>
              )
            })()}
          </Col>
        </Row>
      </Form>
    </div>
  )
}
