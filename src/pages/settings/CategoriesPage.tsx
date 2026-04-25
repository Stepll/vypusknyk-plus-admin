import { useState, useEffect } from 'react'
import { Button, Table, Input, Form, Drawer, Popconfirm, message, Tag, Space } from 'antd'
import { TagsOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ProductCategoryResponse, ProductSubcategoryResponse } from '../../api/types'
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  createProductSubcategory,
  updateProductSubcategory,
  deleteProductSubcategory,
} from '../../api/productCategories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryResponse | null>(null)

  const [catDrawer, setCatDrawer] = useState<{ open: boolean; editing: ProductCategoryResponse | null }>({ open: false, editing: null })
  const [subDrawer, setSubDrawer] = useState<{ open: boolean; editing: ProductSubcategoryResponse | null; categoryId: number | null }>({ open: false, editing: null, categoryId: null })

  const [catForm] = Form.useForm()
  const [subForm] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getProductCategories()
      setCategories(data)
      if (selectedCategory) {
        setSelectedCategory(data.find(c => c.id === selectedCategory.id) ?? null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCatDrawer = (cat?: ProductCategoryResponse) => {
    catForm.setFieldsValue(cat ? { name: cat.name, order: cat.order } : { name: '', order: (categories.length + 1) * 10 })
    setCatDrawer({ open: true, editing: cat ?? null })
  }

  const saveCat = async () => {
    const values = await catForm.validateFields()
    setSaving(true)
    try {
      if (catDrawer.editing) {
        await updateProductCategory(catDrawer.editing.id, values)
        message.success('Категорію оновлено')
      } else {
        await createProductCategory(values)
        message.success('Категорію створено')
      }
      setCatDrawer({ open: false, editing: null })
      await load()
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const deleteCat = async (id: number) => {
    try {
      await deleteProductCategory(id)
      message.success('Категорію видалено')
      if (selectedCategory?.id === id) setSelectedCategory(null)
      await load()
    } catch {
      message.error('Помилка видалення')
    }
  }

  const openSubDrawer = (categoryId: number, sub?: ProductSubcategoryResponse) => {
    const subs = categories.find(c => c.id === categoryId)?.subcategories ?? []
    subForm.setFieldsValue(sub ? { name: sub.name, order: sub.order } : { name: '', order: (subs.length + 1) * 10 })
    setSubDrawer({ open: true, editing: sub ?? null, categoryId })
  }

  const saveSub = async () => {
    const values = await subForm.validateFields()
    setSaving(true)
    try {
      if (subDrawer.editing) {
        await updateProductSubcategory(subDrawer.editing.id, values)
        message.success('Підкатегорію оновлено')
      } else {
        await createProductSubcategory(subDrawer.categoryId!, values)
        message.success('Підкатегорію створено')
      }
      setSubDrawer({ open: false, editing: null, categoryId: null })
      await load()
    } catch {
      message.error('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const deleteSub = async (id: number) => {
    try {
      await deleteProductSubcategory(id)
      message.success('Підкатегорію видалено')
      await load()
    } catch {
      message.error('Помилка видалення')
    }
  }

  const catColumns = [
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ProductCategoryResponse) => (
        <a onClick={() => setSelectedCategory(record)} style={{ fontWeight: 500 }}>{name}</a>
      ),
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      width: 90,
    },
    {
      title: 'Підкатегорій',
      key: 'subs',
      width: 120,
      render: (_: unknown, record: ProductCategoryResponse) => (
        <Tag>{record.subcategories.length}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: ProductCategoryResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openCatDrawer(record)} />
          <Popconfirm title="Видалити категорію?" onConfirm={() => deleteCat(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const subColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Порядок', dataIndex: 'order', key: 'order', width: 90 },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, record: ProductSubcategoryResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openSubDrawer(selectedCategory!.id, record)} />
          <Popconfirm title="Видалити підкатегорію?" onConfirm={() => deleteSub(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <TagsOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Категорії товарів</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Управління категоріями та підкатегоріями продуктів</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Категорії</span>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openCatDrawer()}>
              Додати
            </Button>
          </div>
          <Table
            dataSource={categories}
            columns={catColumns}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={false}
            rowClassName={(record) => record.id === selectedCategory?.id ? 'ant-table-row-selected' : ''}
          />
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>
              {selectedCategory ? `Підкатегорії — ${selectedCategory.name}` : 'Підкатегорії'}
            </span>
            {selectedCategory && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openSubDrawer(selectedCategory.id)}>
                Додати
              </Button>
            )}
          </div>
          {selectedCategory ? (
            <Table
              dataSource={selectedCategory.subcategories}
              columns={subColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          ) : (
            <div style={{ color: '#8c8c8c', textAlign: 'center', paddingTop: 40, fontSize: 13 }}>
              Оберіть категорію зліва
            </div>
          )}
        </div>
      </div>

      <Drawer
        title={catDrawer.editing ? 'Редагувати категорію' : 'Нова категорія'}
        open={catDrawer.open}
        onClose={() => setCatDrawer({ open: false, editing: null })}
        width={360}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCatDrawer({ open: false, editing: null })} style={{ marginRight: 8 }}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={saveCat}>Зберегти</Button>
          </div>
        }
      >
        <Form form={catForm} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order" label="Порядок" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={subDrawer.editing ? 'Редагувати підкатегорію' : 'Нова підкатегорія'}
        open={subDrawer.open}
        onClose={() => setSubDrawer({ open: false, editing: null, categoryId: null })}
        width={360}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setSubDrawer({ open: false, editing: null, categoryId: null })} style={{ marginRight: 8 }}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={saveSub}>Зберегти</Button>
          </div>
        }
      >
        <Form form={subForm} layout="vertical">
          <Form.Item name="name" label="Назва" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order" label="Порядок" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
