import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Descriptions, Row, Spin, Table, message } from 'antd'
import { ArrowLeftOutlined, CrownOutlined, LockOutlined } from '@ant-design/icons'
import { getAdmin } from '../../api/admins'
import type { AdminAdminDetail } from '../../api/types'

const actionsColumns = [
  { title: 'Дія', dataIndex: 'action', key: 'action' },
  { title: 'Деталі', dataIndex: 'details', key: 'details' },
  { title: 'Час', dataIndex: 'createdAt', key: 'createdAt' },
]

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<AdminAdminDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdmin(Number(id))
      .then(setAdmin)
      .catch(() => { message.error('Не вдалося завантажити адміна'); navigate('/admins') })
      .finally(() => setLoading(false))
  }, [id, navigate])

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
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{admin.fullName}</h2>
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
              <Descriptions.Item label="Зареєстрований">{fmt(admin.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Останній логін">{fmt(admin.lastLoginAt)}</Descriptions.Item>
              <Descriptions.Item label="Пароль">
                <Button size="small" icon={<LockOutlined />} disabled>
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
    </div>
  )
}
