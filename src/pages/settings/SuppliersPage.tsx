import { useEffect, useState } from 'react'
import {
  Table, Button, Drawer, Form, Input, Space, Popconfirm, Tag, message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons'
import * as api from '../../api/deliveries'
import type { SupplierResponse } from '../../api/types'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      setSuppliers(await api.getSuppliers())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (s: SupplierResponse) => {
    setEditing(s)
    form.setFieldsValue({
      name: s.name,
      contactPerson: s.contactPerson ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      taxId: s.taxId ?? '',
      address: s.address ?? '',
      notes: s.notes ?? '',
    })
    setDrawerOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      const payload = {
        name: values.name,
        contactPerson: values.contactPerson || null,
        phone: values.phone || null,
        email: values.email || null,
        taxId: values.taxId || null,
        address: values.address || null,
        notes: values.notes || null,
      }
      if (editing) {
        const updated = await api.updateSupplier(editing.id, payload)
        setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s))
        message.success('Постачальника оновлено')
      } else {
        const created = await api.createSupplier(payload)
        setSuppliers(prev => [...prev, created])
        message.success('Постачальника створено')
      }
      setDrawerOpen(false)
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSupplier(id)
      setSuppliers(prev => prev.filter(s => s.id !== id))
      message.success('Постачальника видалено')
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Помилка')
    }
  }

  const columns = [
    {
      title: 'Назва', dataIndex: 'name', key: 'name',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Контактна особа', dataIndex: 'contactPerson', key: 'contactPerson',
      render: (v: string | null) => v ?? <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Телефон', dataIndex: 'phone', key: 'phone',
      render: (v: string | null) => v
        ? <a href={`tel:${v}`} style={{ color: '#4F46E5' }}>{v}</a>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Email', dataIndex: 'email', key: 'email',
      render: (v: string | null) => v
        ? <a href={`mailto:${v}`} style={{ color: '#4F46E5' }}>{v}</a>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'ЄДРПОУ / ІПН', dataIndex: 'taxId', key: 'taxId',
      render: (v: string | null) => v
        ? <Tag style={{ fontFamily: 'monospace' }}>{v}</Tag>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Адреса', dataIndex: 'address', key: 'address',
      render: (v: string | null) => v
        ? <span style={{ color: '#6B7280', fontSize: 13 }}>{v}</span>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Дії', key: 'actions', width: 100,
      render: (_: unknown, r: SupplierResponse) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm
            title="Видалити постачальника?"
            description="Поставки не будуть видалені, лише зв'язок з постачальником."
            okText="Видалити" cancelText="Скасувати" okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #0891b2 0%, #0f766e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <ShopOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Постачальники</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Компанії та ФОП, від яких надходять товари</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Додати постачальника
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={suppliers}
        columns={columns}
        loading={loading}
        pagination={false}
        expandable={{
          expandedRowRender: r => r.notes
            ? <div style={{ padding: '8px 16px', color: '#6B7280', fontSize: 13 }}>
                <strong>Нотатка:</strong> {r.notes}
              </div>
            : null,
          rowExpandable: r => !!r.notes,
        }}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShopOutlined />
            <span>{editing ? 'Редагувати постачальника' : 'Новий постачальник'}</span>
          </div>
        }
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => setDrawerOpen(false)}>Скасувати</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {editing ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Назва компанії / ФОП"
            rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="ТОВ «Приклад» або Іваненко І. І." />
          </Form.Item>
          <Form.Item name="contactPerson" label="Контактна особа">
            <Input placeholder="Іванова Марія Петрівна" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="phone" label="Телефон" style={{ flex: 1 }}>
              <Input placeholder="+380 XX XXX XX XX" />
            </Form.Item>
            <Form.Item name="email" label="Email" style={{ flex: 1 }}>
              <Input placeholder="mail@example.com" />
            </Form.Item>
          </div>
          <Form.Item name="taxId" label="ЄДРПОУ / ІПН">
            <Input placeholder="12345678" maxLength={20} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item name="address" label="Адреса">
            <Input placeholder="м. Київ, вул. Хрещатик, 1" />
          </Form.Item>
          <Form.Item name="notes" label="Нотатка">
            <Input.TextArea rows={3} placeholder="Умови роботи, терміни доставки, знижки..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
