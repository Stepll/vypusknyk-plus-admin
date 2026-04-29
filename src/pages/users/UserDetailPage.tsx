import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Card, Col, Drawer, Dropdown, Input, Row, Spin, Table, Tag, Tooltip, message,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DownOutlined, EditOutlined, MailOutlined, MessageOutlined, MobileOutlined, SendOutlined, UserOutlined,
} from '@ant-design/icons'
import { getUser, patchUserInfo, patchUserVerification, sendUserActivationEmail } from '../../api/users'
import { apiFetch } from '../../api/client'
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

  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendingCustomEmail, setSendingCustomEmail] = useState(false)

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

  const handleSendCustomEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      message.warning('Заповніть тему і текст листа')
      return
    }
    setSendingCustomEmail(true)
    try {
      await apiFetch(`/api/v1/admin/users/${id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      })
      message.success('Лист надіслано')
      setEmailDrawerOpen(false)
      setEmailSubject('')
      setEmailBody('')
    } catch {
      message.error('Не вдалося надіслати лист')
    } finally {
      setSendingCustomEmail(false)
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

  const viberPhone = user.phone
    ? user.phone.replace(/\D/g, '').replace(/^380/, '+380')
    : null

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

      {/* Contact block + Info block */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {/* Contact card — 40% */}
        <Col xs={24} xl={9}>
          <Card
            style={{ borderRadius: 12, height: '100%' }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Зв'язок з клієнтом</span>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#8c8c8c', fontSize: 13, width: 70, flexShrink: 0 }}>Email</span>
                <Tooltip title={user.email ? undefined : 'Email не вказано'}>
                  <Button
                    icon={<MailOutlined />}
                    size="small"
                    disabled={!user.email}
                    onClick={() => setEmailDrawerOpen(true)}
                  >
                    Написати лист
                  </Button>
                </Tooltip>
              </div>

              {/* SMS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#8c8c8c', fontSize: 13, width: 70, flexShrink: 0 }}>SMS</span>
                <Tooltip title="Незабаром">
                  <Button icon={<MobileOutlined />} size="small" disabled>
                    Надіслати SMS
                  </Button>
                </Tooltip>
              </div>

              {/* Telegram */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#8c8c8c', fontSize: 13, width: 70, flexShrink: 0, paddingTop: 4 }}>Telegram</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Tooltip title="Незабаром">
                    <Button icon={<MessageOutlined />} size="small" disabled>
                      Написати через бот
                    </Button>
                  </Tooltip>
                  <Tooltip title={viberPhone ? undefined : 'Телефон не вказано'}>
                    <Button
                      icon={<SendOutlined />}
                      size="small"
                      disabled={!viberPhone}
                      href={viberPhone ? `https://t.me/${encodeURIComponent(viberPhone)}` : undefined}
                      target="_blank"
                    >
                      Відкрити чат у Telegram
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Viber */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#8c8c8c', fontSize: 13, width: 70, flexShrink: 0, paddingTop: 4 }}>Viber</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Tooltip title="Незабаром">
                    <Button icon={<MessageOutlined />} size="small" disabled>
                      Написати через бізнес-чат
                    </Button>
                  </Tooltip>
                  <Tooltip title={viberPhone ? undefined : 'Телефон не вказано'}>
                    <Button
                      icon={<SendOutlined />}
                      size="small"
                      disabled={!viberPhone}
                      href={viberPhone ? `viber://chat?number=${encodeURIComponent(viberPhone)}` : undefined}
                    >
                      Відкрити чат у Viber
                    </Button>
                  </Tooltip>
                </div>
              </div>

            </div>
          </Card>
        </Col>

        {/* Info card — 60% */}
        <Col xs={24} xl={15}>
          <Card style={{ borderRadius: 12, height: '100%' }}>
            <Row gutter={32}>
              {/* Column 1: Name, Phone, Email */}
              <Col xs={24} md={14}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>

                  {/* Name */}
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', color: '#8c8c8c', fontSize: 13, display: 'flex', alignItems: 'flex-start', paddingTop: 14 }}>Імʼя</div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <EditableField value={user.fullName} field="fullName" userId={userId} onUpdate={handleUpdate} />
                    <div><VerificationTag verified={user.isNameVerified} field="isNameVerified" userId={userId} onUpdate={handleUpdate} /></div>
                  </div>

                  {/* Phone */}
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', color: '#8c8c8c', fontSize: 13, display: 'flex', alignItems: 'flex-start', paddingTop: 14 }}>Телефон</div>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <EditableField value={user.phone} field="phone" userId={userId} onUpdate={handleUpdate} />
                    <div><VerificationTag verified={user.isPhoneVerified} field="isPhoneVerified" userId={userId} onUpdate={handleUpdate} /></div>
                  </div>

                  {/* Email */}
                  <div style={{ padding: '10px 14px', color: '#8c8c8c', fontSize: 13, display: 'flex', alignItems: 'flex-start', paddingTop: 14 }}>Email</div>
                  <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 14, color: user.email ? undefined : '#bfbfbf' }}>{user.email ?? '–'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <VerificationTag verified={user.isEmailVerified} field="isEmailVerified" userId={userId} onUpdate={handleUpdate} />
                      {user.email && (
                        <Button size="small" icon={<MailOutlined />} loading={sendingEmail} onClick={handleSendActivation}>
                          Надіслати лист активації
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              </Col>

              {/* Column 2: rest */}
              <Col xs={24} md={10}>
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
        </Col>
      </Row>

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

      {/* Email drawer */}
      <Drawer
        title="Написати лист"
        open={emailDrawerOpen}
        onClose={() => setEmailDrawerOpen(false)}
        width={480}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEmailDrawerOpen(false)}>Скасувати</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sendingCustomEmail}
              onClick={handleSendCustomEmail}
            >
              Надіслати
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>Кому</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>Тема</div>
            <Input
              placeholder="Тема листа"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>Повідомлення</div>
            <Input.TextArea
              placeholder="Текст листа (HTML підтримується)"
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              rows={10}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
