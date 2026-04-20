import { useEffect, useState } from 'react'
import { Button, Drawer, Form, Input, Popconfirm, Table, message } from 'antd'
import { CrownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { createAdmin, deleteAdmin, getAdmins } from '../../api/admins'
import type { AdminAdminItem } from '../../api/types'

export default function AdminsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminAdminItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const pageSize = 20

  const load = (p = page) => {
    setLoading(true)
    getAdmins(p, pageSize)
      .then(res => { setItems(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleCreate = async (values: { email: string; fullName: string; password: string }) => {
    setSaving(true)
    try {
      await createAdmin(values)
      message.success('Адміна додано')
      setDrawerOpen(false)
      form.resetFields()
      load()
    } catch {
      message.error('Помилка при створенні адміна')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAdmin(id)
      message.success('Адміна видалено')
      setItems(prev => prev.filter(a => a.id !== id))
      setTotal(t => t - 1)
    } catch {
      message.error('Помилка при видаленні')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (v: number) => (
        <Button type="link" style={{ padding: 0 }} onClick={e => { e.stopPropagation(); navigate(`/admins/${v}`) }}>
          {v}
        </Button>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: "Ім'я", dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Доданий',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: unknown, row: AdminAdminItem) => (
        <Popconfirm
          title="Видалити адміна?"
          okText="Так"
          cancelText="Ні"
          onConfirm={e => { e?.stopPropagation(); handleDelete(row.id) }}
          onPopupClick={e => e.stopPropagation()}
        >
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={e => e.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <CrownOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Адміни</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Список адміністраторів платформи</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          Додати адміна
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={{ current: page, pageSize, total, onChange: setPage }}
        onRow={record => ({ onClick: () => navigate(`/admins/${record.id}`), style: { cursor: 'pointer' } })}
      />

      <Drawer
        title="Додати адміна"
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields() }}
        width={400}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields() }}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>Створити</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Введіть коректний email' }]}
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item
            label="Повне ім'я"
            name="fullName"
            rules={[{ required: true, message: "Введіть ім'я" }]}
          >
            <Input placeholder="Іван Іваненко" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, min: 6, message: 'Мінімум 6 символів' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
