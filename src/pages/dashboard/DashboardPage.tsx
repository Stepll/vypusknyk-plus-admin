import { Col, Row } from 'antd'
import { ShoppingCartOutlined, AppstoreOutlined, TeamOutlined } from '@ant-design/icons'

const stats = [
  {
    title: 'Замовлення',
    value: '—',
    icon: <ShoppingCartOutlined />,
    bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    shadow: 'rgba(79, 70, 229, 0.3)',
  },
  {
    title: 'Продукти',
    value: '—',
    icon: <AppstoreOutlined />,
    bg: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
    shadow: 'rgba(5, 150, 105, 0.3)',
  },
  {
    title: 'Користувачі',
    value: '—',
    icon: <TeamOutlined />,
    bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    shadow: 'rgba(245, 158, 11, 0.3)',
  },
]

export default function DashboardPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Дашборд</h2>
        <p style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Загальна статистика платформи</p>
      </div>
      <Row gutter={[20, 20]}>
        {stats.map(stat => (
          <Col xs={24} sm={8} key={stat.title}>
            <div style={{
              background: stat.bg,
              borderRadius: 12,
              padding: '22px 24px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: `0 6px 20px ${stat.shadow}`,
            }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{stat.value}</div>
              </div>
              <div style={{ fontSize: 44, opacity: 0.2 }}>
                {stat.icon}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
