import { useEffect, useState } from 'react'
import { Button, Checkbox, Drawer, Form, Input, Popconfirm, Table, Tag, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { getRoles, createRole, updateRole, deleteRole } from '../../api/roles'
import type { RoleResponse } from '../../api/types'

const COLORS = [
  '#722ed1', '#1677ff', '#52c41a', '#f5222d', '#fa8c16',
  '#fadb14', '#13c2c2', '#eb2f96', '#595959', '#000000',
]

const PAGE_GROUPS = [
  {
    label: 'Основне',
    pages: [
      { key: 'dashboard', label: 'Дашборд' },
      { key: 'orders', label: 'Замовлення' },
      { key: 'products', label: 'Продукти' },
      { key: 'users', label: 'Користувачі' },
      { key: 'designs', label: 'Збережені дизайни' },
      { key: 'admins', label: 'Адміни' },
      { key: 'warehouse', label: 'Складський облік' },
      { key: 'deliveries', label: 'Поставки' },
      { key: 'history', label: 'Історія змін' },
    ],
  },
  {
    label: 'Налаштування',
    pages: [
      { key: 'settings.categories', label: 'Категорії товарів' },
      { key: 'settings.delivery-methods', label: 'Методи доставки' },
      { key: 'settings.payment-methods', label: 'Методи оплати' },
      { key: 'settings.order-statuses', label: 'Статуси замовлень' },
      { key: 'settings.suppliers', label: 'Постачальники' },
      { key: 'settings.roles', label: 'Ролі' },
      { key: 'settings.colors', label: 'Кольори' },
    ],
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState(COLORS[1])
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [form] = Form.useForm()

  const load = () => {
    setLoading(true)
    getRoles()
      .then(setRoles)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingRole(null)
    setSelectedColor(COLORS[1])
    setSelectedPages([])
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (role: RoleResponse) => {
    setEditingRole(role)
    setSelectedColor(role.color)
    setSelectedPages(role.pages)
    form.setFieldsValue({ name: role.name })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingRole(null)
    form.resetFields()
  }

  const handleSave = async (values: { name: string }) => {
    setSaving(true)
    try {
      if (editingRole) {
        const updated = await updateRole(editingRole.id, { name: values.name, color: selectedColor, pages: selectedPages })
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r))
        message.success('Роль оновлено')
      } else {
        const created = await createRole({ name: values.name, color: selectedColor, pages: selectedPages })
        setRoles(prev => [...prev, created])
        message.success('Роль створено')
      }
      closeDrawer()
    } catch {
      message.error('Помилка при збереженні ролі')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id)
      setRoles(prev => prev.filter(r => r.id !== id))
      message.success('Роль видалено')
    } catch {
      message.error('Помилка при видаленні ролі')
    }
  }

  const togglePage = (key: string) => {
    setSelectedPages(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    )
  }

  const toggleGroup = (pages: { key: string }[]) => {
    const keys = pages.map(p => p.key)
    const allSelected = keys.every(k => selectedPages.includes(k))
    if (allSelected) {
      setSelectedPages(prev => prev.filter(p => !keys.includes(p)))
    } else {
      setSelectedPages(prev => [...new Set([...prev, ...keys])])
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: 'Назва',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, role: RoleResponse) => (
        <Tag color={role.color} style={{ fontSize: 13, padding: '2px 10px' }}>{name}</Tag>
      ),
    },
    {
      title: 'Доступ',
      key: 'pages',
      render: (_: unknown, role: RoleResponse) =>
        role.isSuperAdmin
          ? <span style={{ color: '#722ed1', fontWeight: 500 }}>Повний доступ</span>
          : <span style={{ color: '#8c8c8c' }}>{role.pages.length} сторінок</span>,
    },
    {
      title: 'Тип',
      key: 'type',
      render: (_: unknown, role: RoleResponse) =>
        role.isSuperAdmin ? <Tag color="purple">Системна</Tag> : null,
    },
    {
      title: 'Створена',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, role: RoleResponse) =>
        !role.isSuperAdmin ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(role)} />
            <Popconfirm
              title="Видалити роль?"
              description="Адміни з цією роллю залишаться без ролі"
              okText="Так"
              cancelText="Ні"
              onConfirm={() => handleDelete(role.id)}
            >
              <Button danger type="text" size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <SafetyCertificateOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Ролі</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Управління ролями та правами доступу</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Додати роль
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={roles}
        columns={columns}
        loading={loading}
        pagination={false}
      />

      <Drawer
        title={editingRole ? 'Редагувати роль' : 'Створити роль'}
        open={drawerOpen}
        onClose={closeDrawer}
        width={420}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={closeDrawer}>Скасувати</Button>
            <Button type="primary" loading={saving} onClick={() => form.submit()}>
              {editingRole ? 'Зберегти' : 'Створити'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Назва"
            name="name"
            rules={[{ required: true, message: 'Введіть назву ролі' }]}
          >
            <Input placeholder="Наприклад: Менеджер" />
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: '#262626' }}>Колір</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map(color => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  cursor: 'pointer',
                  border: selectedColor === color ? '3px solid #1677ff' : '3px solid transparent',
                  outline: selectedColor === color ? `2px solid ${color}` : 'none',
                  outlineOffset: 2,
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Tag color={selectedColor} style={{ fontSize: 13, padding: '2px 10px' }}>
              {form.getFieldValue('name') || 'Приклад ролі'}
            </Tag>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: '#262626' }}>Доступ до сторінок</div>
          {PAGE_GROUPS.map(group => {
            const groupKeys = group.pages.map(p => p.key)
            const allChecked = groupKeys.every(k => selectedPages.includes(k))
            const someChecked = groupKeys.some(k => selectedPages.includes(k))
            return (
              <div key={group.label} style={{ marginBottom: 16 }}>
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked && !allChecked}
                  onChange={() => toggleGroup(group.pages)}
                  style={{ fontWeight: 600, marginBottom: 8, color: '#595959' }}
                >
                  {group.label}
                </Checkbox>
                <div style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.pages.map(page => (
                    <Checkbox
                      key={page.key}
                      checked={selectedPages.includes(page.key)}
                      onChange={() => togglePage(page.key)}
                    >
                      {page.label}
                    </Checkbox>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Drawer>
    </div>
  )
}
