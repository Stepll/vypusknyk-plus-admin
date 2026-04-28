import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Row, Spin, Table, Tag, message } from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { getUser } from '../../api/users'
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

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser(Number(id))
      .then(setUser)
      .catch(() => { message.error('Не вдалося завантажити користувача'); navigate('/users') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  if (!user) return null

  const createdAt = new Date(user.createdAt).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
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

      <Row gutter={24} align="top">
        {/* Left — orders + designs */}
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

        {/* Right — user info */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 12 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Інформація</span>}
          >
            <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c' } }}>
              <Descriptions.Item label="Тип">
                {user.isGuest
                  ? <Tag color="orange">Гість</Tag>
                  : <Tag color="green">Зареєстрований</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Email">{user.email ?? '–'}</Descriptions.Item>
              <Descriptions.Item label="Імʼя">{user.fullName}</Descriptions.Item>
              <Descriptions.Item label="Телефон">{user.phone ?? '–'}</Descriptions.Item>
              <Descriptions.Item label="Дата">{createdAt}</Descriptions.Item>
              <Descriptions.Item label="Замовлень">{user.orders.length}</Descriptions.Item>
              <Descriptions.Item label="Дизайнів">{user.savedDesigns.length}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
