import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Drawer, Form, Input, Row, Select, Spin, Table, Tag, message } from 'antd'
import { ArrowLeftOutlined, CrownOutlined, LockOutlined } from '@ant-design/icons'
import { getAdmin, changeAdminPassword, changeAdminRole } from '../../api/admins'
import { getRoles } from '../../api/roles'
import type { AdminAdminDetail, RoleResponse } from '../../api/types'
import { authStore } from '../../stores/AuthStore'
import { observer } from 'mobx-react-lite'

const actionsColumns = [
  { title: 'Дія', dataIndex: 'action', key: 'action' },
  { title: 'Деталі', dataIndex: 'details', key: 'details' },
  { title: 'Час', dataIndex: 'createdAt', key: 'createdAt' },
]

const AdminDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<AdminAdminDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [changingRole, setChangingRole] = useState(false)
  const [form] = Form.useForm()

  const adminId = Number(id)
  const isSuperAdmin = authStore.isSuperAdmin
  const isOwnPage = authStore.admin?.id === adminId
  const canChangePassword = isSuperAdmin || isOwnPage
  const canChangeRole = isSuperAdmin

  useEffect(() => {
    getAdmin(adminId)
      .then(setAdmin)
      .catch(() => { message.error('Не вдалося завантажити адміна'); navigate('/admins') })
      .finally(() => setLoading(false))

    if (isSuperAdmin) {
      getRoles().then(setRoles)
    }
  }, [adminId, navigate, isSuperAdmin])

  const handlePasswordSave = async (values: { newPassword: string }) => {
    setSavingPassword(true)
    try {
      await changeAdminPassword(adminId, values.newPassword)
      message.success('Пароль змінено')
      setPasswordDrawerOpen(false)
      form.resetFields()
    } catch {
      message.error('Помилка при зміні пароля')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleRoleChange = async (roleId: number | null) => {
    if (!admin) return
    setChangingRole(true)
    try {
      const updated = await changeAdminRole(adminId, roleId)
      setAdmin(updated)
      message.success('Роль змінено')
    } catch {
      message.error('Помилка при зміні ролі')
    } finally {
      setChangingRole(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  if (!admin) return null

  const fmt = (v: string | null) => v
    ? new Date(v).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '–'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/admins')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <CrownOutlined />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{admin.fullName}</h2>
              {admin.role && <Tag color={admin.role.color}>{admin.role.name}</Tag>}
            </div>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>{admin.email}</p>
          </div>
        </div>
      </div>

      <Row gutter={24} align="top">
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 12, marginBottom: 16 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Інформація</span>}
          >
            <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c' } }}>
              <Descriptions.Item label="Email">{admin.email}</Descriptions.Item>
              <Descriptions.Item label="Роль">
                {canChangeRole ? (
                  <Select
                    size="small"
                    value={admin.role?.id ?? null}
                    onChange={handleRoleChange}
                    loading={changingRole}
                    allowClear
                    placeholder="Без ролі"
                    style={{ minWidth: 140 }}
                    options={roles.map(r => ({
                      value: r.id,
                      label: <Tag color={r.color} style={{ margin: 0 }}>{r.name}</Tag>,
                    }))}
                  />
                ) : admin.role ? (
                  <Tag color={admin.role.color}>{admin.role.name}</Tag>
                ) : (
                  <span style={{ color: '#bfbfbf' }}>Не призначено</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Зареєстрований">{fmt(admin.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Останній логін">{fmt(admin.lastLoginAt)}</Descriptions.Item>
              <Descriptions.Item label="Пароль">
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  disabled={!canChangePassword}
                  onClick={() => setPasswordDrawerOpen(true)}
                >
                  Змінити пароль
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 12 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Останні дії</span>}
          >
            <Table
              rowKey="id"
              dataSource={[]}
              columns={actionsColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Немає даних' }}
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        title="Змінити пароль"
        open={passwordDrawerOpen}
        onClose={() => { setPasswordDrawerOpen(false); form.resetFields() }}
        width={360}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => { setPasswordDrawerOpen(false); form.resetFields() }}>Скасувати</Button>
            <Button type="primary" loading={savingPassword} onClick={() => form.submit()}>Зберегти</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handlePasswordSave}>
          <Form.Item
            label="Новий пароль"
            name="newPassword"
            rules={[{ required: true, min: 6, message: 'Мінімум 6 символів' }]}
          >
            <Input.Password placeholder="••••••••" autoFocus />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
})

export default AdminDetailPage
