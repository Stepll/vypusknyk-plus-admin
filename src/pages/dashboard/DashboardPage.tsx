import { Card, Col, Row, Statistic } from 'antd'
import { ShoppingCartOutlined, AppstoreOutlined, TeamOutlined } from '@ant-design/icons'

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Дашборд</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Замовлення" value="—" prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Продукти" value="—" prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Користувачі" value="—" prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
