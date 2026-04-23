import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row, Statistic, Table, Tag, Progress, Spin, Typography } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getDashboard } from '../../api/dashboard'
import type { DashboardResponse } from '../../api/types'
import { RIBBON_COLORS, EMBLEMS, FONTS } from '../../constants/ribbonRules'

const { Text } = Typography

const CATEGORY_LABELS: Record<string, string> = {
  Ribbon: 'Стрічки',
  Medal: 'Медалі',
  Certificate: 'Грамоти',
  Accessory: 'Аксесуари',
}

const STATUS_COLORS: Record<string, string> = {
  Accepted: '#6366f1',
  Production: '#f59e0b',
  Shipped: '#3b82f6',
  Delivered: '#10b981',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!data) return null

  const { revenue, orders, chart, deliveries, designs, topProducts } = data

  const emblemLabel = (key: string) => EMBLEMS.find(e => e.key === Number(key))?.label ?? `Емблема ${key}`
  const colorLabel = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.label ?? key
  const colorHex = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.hex ?? '#8c8c8c'
  const fontLabel = (key: string) => FONTS.find(f => f.value === key)?.label ?? key

  const chartData = chart.map(p => ({
    date: p.date.slice(5),
    'Замовлення': p.orders,
    'Відвідування': p.visits,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Дашборд</h2>
        <p style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Загальна статистика платформи</p>
      </div>

      {/* Block 1 — Revenue */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: '4px solid #6366f1' }}>
            <Statistic
              title="Виручка цього місяця"
              value={revenue.currentMonth}
              precision={0}
              suffix="₴"
              valueStyle={{ color: '#1a1a2e', fontSize: 28 }}
            />
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {revenue.changePercent >= 0 ? (
                <Text type="success"><ArrowUpOutlined /> +{revenue.changePercent}% до минулого місяця</Text>
              ) : (
                <Text type="danger"><ArrowDownOutlined /> {revenue.changePercent}% до минулого місяця</Text>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: '4px solid #94a3b8' }}>
            <Statistic
              title="Виручка минулого місяця"
              value={revenue.previousMonth}
              precision={0}
              suffix="₴"
              valueStyle={{ color: '#64748b', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: '4px solid #10b981' }}>
            <Statistic
              title="Середній час виробництва"
              value={revenue.avgProductionDays}
              precision={1}
              suffix="дн."
              valueStyle={{ color: '#1a1a2e', fontSize: 28 }}
            />
            <div style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>від прийому до відправки</div>
          </Card>
        </Col>
      </Row>

      {/* Block 2 — Orders */}
      <Row gutter={[12, 12]}>
        {[
          { label: 'Прийнято', value: orders.accepted, color: STATUS_COLORS.Accepted },
          { label: 'Виробництво', value: orders.production, color: STATUS_COLORS.Production },
          { label: 'Відправлено', value: orders.shipped, color: STATUS_COLORS.Shipped },
          { label: 'Доставлено', value: orders.delivered, color: STATUS_COLORS.Delivered },
          { label: 'Нові за тиждень', value: orders.newThisWeek, color: '#8b5cf6' },
          { label: 'Застряглі >3д', value: orders.stuck, color: '#ef4444', icon: <WarningOutlined /> },
        ].map(s => (
          <Col xs={12} sm={8} lg={4} key={s.label}>
            <Card bodyStyle={{ padding: '16px 20px' }} style={{ borderLeft: `4px solid ${s.color}`, height: '100%' }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                {s.icon && <span style={{ marginRight: 4 }}>{s.icon}</span>}{s.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.value > 0 && s.label.includes('Застряглі') ? '#ef4444' : '#1a1a2e', lineHeight: 1 }}>
                {s.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Block 3 — Chart */}
      <Card title="Замовлення за останні 30 днів">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Замовлення" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="Відвідування" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Block 4 — Deliveries */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={<><ClockCircleOutlined style={{ marginRight: 8, color: '#f59e0b' }} />Чекають прийняття</>}>
            {deliveries.awaiting.length === 0 ? (
              <Text type="secondary">Немає поставок для прийняття</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deliveries.awaiting.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/deliveries/${d.id}`} style={{ fontWeight: 600 }}>#{d.number}</Link>
                      {d.supplierName && <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 8 }}>{d.supplierName}</span>}
                    </div>
                    <div style={{ width: 120, flexShrink: 0 }}>
                      <Progress
                        percent={d.totalExpected > 0 ? Math.round(d.totalReceived / d.totalExpected * 100) : 0}
                        size="small"
                        format={() => `${d.totalReceived}/${d.totalExpected}`}
                        strokeColor={d.status === 'partial' ? '#f59e0b' : '#94a3b8'}
                      />
                    </div>
                    <Tag color={d.status === 'partial' ? 'orange' : 'default'} style={{ flexShrink: 0 }}>
                      {d.status === 'partial' ? 'Частково' : 'Очікується'}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Майбутні поставки">
            {deliveries.upcoming.length === 0 ? (
              <Text type="secondary">Немає запланованих поставок</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {deliveries.upcoming.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div>
                      <Link to={`/deliveries/${d.id}`} style={{ fontWeight: 600 }}>#{d.number}</Link>
                      {d.supplierName && <div style={{ color: '#8c8c8c', fontSize: 12 }}>{d.supplierName}</div>}
                    </div>
                    <Tag color="blue">{d.expectedDate}</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Block 5 — Designs */}
      <Card title="Збережені дизайни">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>За тиждень</div>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>{designs.savedThisWeek}</div>
              <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>нових дизайнів</div>
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5c5c5c', marginBottom: 8 }}>Топ кольорів</div>
            {designs.topColors.map((item, i) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8c8c8c', width: 14 }}>{i + 1}</span>
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: colorHex(item.key), border: '1px solid #e0e0e0', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{colorLabel(item.key)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.count}</span>
              </div>
            ))}
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5c5c5c', marginBottom: 8 }}>Топ емблем</div>
            {designs.topEmblems.map((item, i) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8c8c8c', width: 14 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{emblemLabel(item.key)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.count}</span>
              </div>
            ))}
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5c5c5c', marginBottom: 8 }}>Топ шрифтів</div>
            {designs.topFonts.map((item, i) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8c8c8c', width: 14 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{fontLabel(item.key)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{item.count}</span>
              </div>
            ))}
          </Col>
        </Row>
      </Card>

      {/* Block 6 — Top Products */}
      {topProducts.length > 0 && (
        <Row gutter={[16, 16]}>
          {topProducts.map(cat => (
            <Col xs={24} md={8} key={cat.category}>
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{CATEGORY_LABELS[cat.category] ?? cat.category}</span>
                    <Tag color="purple">{cat.totalSold} шт.</Tag>
                  </div>
                }
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  dataSource={cat.products}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Продукт', dataIndex: 'name', ellipsis: true },
                    { title: 'Шт.', dataIndex: 'quantity', width: 60, align: 'right' as const },
                  ]}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
