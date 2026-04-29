import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Card, Col, Dropdown, Input, Row, Spin, Table, Tag, message,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DownOutlined, EditOutlined, MailOutlined, UserOutlined,
} from '@ant-design/icons'
import { getUser, patchUserInfo, patchUserVerification, sendUserActivationEmail } from '../../api/users'
import type { AdminUserDetail, AdminUserOrderSummary } from '../../api/types'

const STATUS_COLORS: Record<string, string> = {
  Accepted:   'blue',
  Production: 'orange',
  Shipped:    'geekblue',
  Delivered:  'green',
}

const STATUS_LABELS: Record<string, string> = {
  Accepted:   'Прийнято',
  Production: 'Виробництво',
  Shipped:    'Відправлено',
  Delivered:  'Доставлено',
}

const orderColumns = (onNavigate: (id: number) => void) => [
  {
    title: '№ замовлення',
    dataIndex: 'orderNumber',
    key: 'orderNumber',
    render: (v: string, row: AdminUserOrderSummary) => (
      <Button type="link" style={{ padding: 0 }} onClick={() => onNavigate(row.id)}>
        #{v}
      </Button>
    ),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (v: string) => (
      <Tag color={STATUS_COLORS[v] ?? 'default'}>{STATUS_LABELS[v] ?? v}</Tag>
    ),
  },
  {
    title: 'Позицій',
    dataIndex: 'itemsCount',
    key: 'itemsCount',
    width: 80,
    align: 'center' as const,
  },
  {
    title: 'Сума',
    dataIndex: 'total',
    key: 'total',
    align: 'right' as const,
    render: (v: number) => `${v.toFixed(2)} ₴`,
  },
  {
    title: 'Дата',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
  },
]

const designColumns = [
  { title: 'Назва дизайну', dataIndex: 'designName', key: 'designName' },
  {
    title: 'Збережено',
    dataIndex: 'savedAt',
    key: 'savedAt',
    render: (v: string) => new Date(v).toLocaleString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
  },
]

type VerificationKey = 'isEmailVerified' | 'isNameVerified' | 'isPhoneVerified'

function VerificationTag({
  verified, field, userId, onUpdate,
}: {
  verified: boolean
  field: VerificationKey
  userId: number
  onUpdate: (data: Partial<AdminUserDetail>) => void
}) {
  const [loading, setLoading] = useState(false)

  const labels: Record<VerificationKey, [string, string]> = {
    isEmailVerified: ['Активований', 'Неактивований'],
    isNameVerified:  ['Підтверджено', 'Непідтверджено'],
    isPhoneVerified: ['Підтверджено', 'Непідтверджено'],
  }

  const [activeLabel, inactiveLabel] = labels[field]

  const items: MenuProps['items'] = [
    {
      key: 'true',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          {activeLabel}
        </span>
      ),
    },
    {
      key: 'false',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          {inactiveLabel}
        </span>
      ),
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    const newVal = key === 'true'
    if (newVal === verified) return
    setLoading(true)
    try {
      const updated = await patchUserVerification(userId, { [field]: newVal })
      onUpdate(updated)
    } catch {
      message.error('Не вдалося оновити статус')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']} disabled={loading}>
      <Tag
        color={verified ? 'success' : 'default'}
        style={{ cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
      >
        {verified ? activeLabel : inactiveLabel}
        <DownOutlined style={{ fontSize: 9, marginLeft: 4, opacity: 0.6 }} />
      </Tag>
    </Dropdown>
  )
}

function EditableField({
  value, field, userId, onUpdate,
}: {
  label?: string
  value: string | null
  field: 'fullName' | 'phone'
  userId: number
  onUpdate: (data: Partial<AdminUserDetail>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 50)
  }, [editing])

  const save = async () => {
    if (draft === (value ?? '')) { setEditing(false); return }
    setSaving(true)
    try {
      const updated = await patchUserInfo(userId, { [field]: draft })
      onUpdate(updated)
      setEditing(false)
    } catch {
      message.error('Не вдалося зберегти')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => { setDraft(value ?? ''); setEditing(false) }

  return editing ? (
    <div style={{ display: 'flex', gap: 4, flex: 1 }}>
      <Input
        ref={inputRef as React.RefObject<any>}
        size="small"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onPressEnter={save}
        onKeyDown={e => e.key === 'Escape' && cancel()}
        style={{ flex: 1 }}
        disabled={saving}
      />
      <Button size="small" type="primary" onClick={save} loading={saving}>OK</Button>
      <Button size="small" onClick={cancel} disabled={saving}>✕</Button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
      <span style={{ fontSize: 14, color: value ? undefined : '#bfbfbf' }}>{value ?? '–'}</span>
      <Button
        type="text" size="small" icon={<EditOutlined />}
        style={{ color: '#bfbfbf', padding: '0 4px' }}
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
      />
    </div>
  )
}

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 32,
  flexWrap: 'wrap',
}

const LABEL_STYLE: React.CSSProperties = {
  color: '#8c8c8c',
  fontSize: 13,
  width: 72,
  flexShrink: 0,
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    getUser(Number(id))
      .then(setUser)
      .catch(() => { message.error('Не вдалося завантажити користувача'); navigate('/users') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleUpdate = (data: Partial<AdminUserDetail>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev)
  }

  const handleSendActivation = async () => {
    setSendingEmail(true)
    try {
      await sendUserActivationEmail(Number(id))
      message.success('Лист активації надіслано')
    } catch {
      message.error('Не вдалося надіслати лист')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  if (!user) return null

  const userId = Number(id)
  const createdAt = new Date(user.createdAt).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/users')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <UserOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.fullName}
              {user.isGuest
                ? <Tag color="orange" style={{ fontWeight: 400, fontSize: 12 }}>Гість</Tag>
                : <Tag color="green" style={{ fontWeight: 400, fontSize: 12 }}>Зареєстрований</Tag>
              }
            </h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
              {user.isGuest ? `Гостьовий профіль • ${createdAt}` : `Зареєстрований ${createdAt}`}
            </p>
          </div>
        </div>
      </div>

      {/* Info block — two columns */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Row gutter={32}>
          {/* Column 1: Name, Phone, Email */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Name */}
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Імʼя</span>
                <EditableField
                  label="Імʼя"
                  value={user.fullName}
                  field="fullName"
                  userId={userId}
                  onUpdate={handleUpdate}
                />
                <VerificationTag
                  verified={user.isNameVerified}
                  field="isNameVerified"
                  userId={userId}
                  onUpdate={handleUpdate}
                />
              </div>

              {/* Phone */}
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Телефон</span>
                <EditableField
                  label="Телефон"
                  value={user.phone}
                  field="phone"
                  userId={userId}
                  onUpdate={handleUpdate}
                />
                <VerificationTag
                  verified={user.isPhoneVerified}
                  field="isPhoneVerified"
                  userId={userId}
                  onUpdate={handleUpdate}
                />
              </div>

              {/* Email */}
              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Email</span>
                <span style={{ fontSize: 14, flex: 1, color: user.email ? undefined : '#bfbfbf' }}>
                  {user.email ?? '–'}
                </span>
                <VerificationTag
                  verified={user.isEmailVerified}
                  field="isEmailVerified"
                  userId={userId}
                  onUpdate={handleUpdate}
                />
                {user.email && (
                  <Button
                    size="small"
                    icon={<MailOutlined />}
                    loading={sendingEmail}
                    onClick={handleSendActivation}
                    style={{ flexShrink: 0 }}
                  >
                    Надіслати лист активації
                  </Button>
                )}
              </div>

            </div>
          </Col>

          {/* Column 2: rest */}
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Тип</span>
                {user.isGuest
                  ? <Tag color="orange">Гість</Tag>
                  : <Tag color="green">Зареєстрований</Tag>
                }
              </div>

              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Дата</span>
                <span style={{ fontSize: 14 }}>{createdAt}</span>
              </div>

              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Замовлень</span>
                <span style={{ fontSize: 14 }}>{user.orders.length}</span>
              </div>

              <div style={ROW_STYLE}>
                <span style={LABEL_STYLE}>Дизайнів</span>
                <span style={{ fontSize: 14 }}>{user.savedDesigns.length}</span>
              </div>

            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={24} align="top">
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 12, marginBottom: 16 }}
            title={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Замовлення{user.orders.length > 0 && ` (${user.orders.length})`}
              </span>
            }
          >
            <Table
              rowKey="id"
              dataSource={user.orders}
              columns={orderColumns(id => navigate(`/orders/${id}`))}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Немає замовлень' }}
            />
          </Card>

          <Card
            style={{ borderRadius: 12 }}
            title={
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Збережені дизайни{user.savedDesigns.length > 0 && ` (${user.savedDesigns.length})`}
              </span>
            }
          >
            <Table
              rowKey="id"
              dataSource={user.savedDesigns}
              columns={designColumns}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Немає збережених дизайнів' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8} />
      </Row>
    </div>
  )
}
