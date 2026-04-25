import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Row, Table, Tag, Progress, Spin, Typography } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { getDashboard, getDashboardStats, getDashboardChart, getDashboardDistributions } from '../../api/dashboard'
import type { DashboardPeriod, DashboardStatMetric, DashboardChartPeriod, DashboardDistributionItem } from '../../api/types'
import type { DashboardResponse } from '../../api/types'
import { RIBBON_COLORS, EMBLEMS, FONTS, MATERIALS } from '../../constants/ribbonRules'

const { Text } = Typography

const PERIOD_OPTIONS = [
  { label: 'День', value: 'day' },
  { label: 'Тиждень', value: 'week' },
  { label: 'Місяць', value: 'month' },
  { label: 'Рік', value: 'year' },
]

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const points = data.map((v, i) => ({ i, v }))
  const color = positive ? '#10b981' : '#ef4444'
  return (
    <LineChart width={80} height={44} data={points}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
    </LineChart>
  )
}

function MetricCard({ label, metric, format }: { label: string; metric: DashboardStatMetric; format: (v: number) => string }) {
  const positive = metric.changePercent >= 0
  const changeColor = positive ? '#10b981' : '#ef4444'
  const ChangeIcon = positive ? ArrowUpOutlined : ArrowDownOutlined
  return (
    <div style={{
      flex: 1,
      background: '#fff',
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{format(metric.current)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: changeColor, marginBottom: 3 }}>
          <ChangeIcon style={{ fontSize: 10, marginRight: 2 }} />{Math.abs(metric.changePercent)}%
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{format(metric.previous)}</div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <MiniSparkline data={metric.sparkline} positive={positive} />
      </div>
    </div>
  )
}

function PeriodSwitcher({ value, onChange, options = PERIOD_OPTIONS }: {
  value: string
  onChange: (v: string) => void
  options?: { label: string; value: string }[]
}) {
  return (
    <div style={{
      display: 'inline-flex',
      background: '#e9eaec',
      borderRadius: 20,
      padding: 3,
      gap: 2,
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '5px 14px',
            borderRadius: 17,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: value === opt.value ? 600 : 400,
            background: value === opt.value ? '#fff' : 'transparent',
            color: value === opt.value ? '#111827' : '#6b7280',
            boxShadow: value === opt.value ? '0 1px 4px rgba(0,0,0,0.13)' : 'none',
            transition: 'all 0.15s ease',
            lineHeight: 1.4,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StatsBlock() {
  const [period, setPeriod] = useState<DashboardPeriod>('month')
  const [stats, setStats] = useState<{ revenue: DashboardStatMetric; ordersCount: DashboardStatMetric; avgCheck: DashboardStatMetric } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDashboardStats(period)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [period])

  const fmtCurrency = (v: number) => `₴${Math.round(v).toLocaleString('uk-UA')}`
  const fmtCount = (v: number) => Math.round(v).toString()

  return (
    <div style={{
      background: '#f3f4f6',
      borderRadius: 16,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PeriodSwitcher value={period} onChange={v => setPeriod(v as DashboardPeriod)} />
      </div>
      {loading || !stats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spin /></div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <MetricCard label="Дохід" metric={stats.revenue} format={fmtCurrency} />
          <MetricCard label="Замовлення" metric={stats.ordersCount} format={fmtCount} />
          <MetricCard label="Середній чек" metric={stats.avgCheck} format={fmtCurrency} />
        </div>
      )}
    </div>
  )
}

const CHART_PERIOD_OPTIONS = [
  { label: 'Місяць', value: 'month' },
  { label: 'Рік', value: 'year' },
]

const DELIVERY_LABELS: Record<string, string> = {
  NovaPoshta: 'Нова Пошта',
  Ukrposhta: 'Укрпошта',
}
const DELIVERY_COLORS: Record<string, string> = {
  NovaPoshta: '#ef4444',
  Ukrposhta: '#3b82f6',
}
const MATERIAL_COLORS: Record<string, string> = {
  atlas: '#8b5cf6',
  silk: '#ec4899',
  satin: '#f59e0b',
}

function DonutChart({ data, colorMap, labelMap }: {
  data: DashboardDistributionItem[]
  colorMap: (key: string) => string
  labelMap: (key: string) => string
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (data.length === 0 || total === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: '#9ca3af', fontSize: 13 }}>Немає даних</div>
  }
  const chartData = data.map(d => ({ name: labelMap(d.key), value: d.count, key: d.key }))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <PieChart width={110} height={110}>
        <Pie data={chartData} cx={50} cy={50} innerRadius={30} outerRadius={50} dataKey="value" isAnimationActive={false}>
          {chartData.map(entry => (
            <Cell key={entry.key} fill={colorMap(entry.key)} />
          ))}
        </Pie>
      </PieChart>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chartData.map(entry => (
          <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap(entry.key), flexShrink: 0 }} />
            <span style={{ flex: 1, color: '#374151' }}>{entry.name}</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{Math.round(entry.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DistributionsBlock() {
  const [period, setPeriod] = useState<DashboardChartPeriod>('month')
  const [data, setData] = useState<{ deliveryMethods: DashboardDistributionItem[]; materials: DashboardDistributionItem[]; colors: DashboardDistributionItem[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDashboardDistributions(period).then(setData).finally(() => setLoading(false))
  }, [period])

  const colorLabel = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.label ?? key
  const colorHex = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.hex ?? '#8c8c8c'
  const materialLabel = (key: string) => MATERIALS.find(m => m.value === key)?.label ?? key

  const subBlocks = [
    {
      title: 'Метод доставки',
      items: data?.deliveryMethods ?? [],
      colorMap: (k: string) => DELIVERY_COLORS[k] ?? '#94a3b8',
      labelMap: (k: string) => DELIVERY_LABELS[k] ?? k,
    },
    {
      title: 'Матеріал',
      items: data?.materials ?? [],
      colorMap: (k: string) => MATERIAL_COLORS[k] ?? '#94a3b8',
      labelMap: materialLabel,
    },
    {
      title: 'Колір стрічки',
      items: data?.colors ?? [],
      colorMap: colorHex,
      labelMap: colorLabel,
    },
  ]

  return (
    <div style={{ background: '#f3f4f6', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PeriodSwitcher value={period} onChange={p => setPeriod(p as DashboardChartPeriod)} options={CHART_PERIOD_OPTIONS} />
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin /></div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          {subBlocks.map(block => (
            <div key={block.title} style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 10 }}>{block.title.toUpperCase()}</div>
              <DonutChart data={block.items} colorMap={block.colorMap} labelMap={block.labelMap} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChartsBlock() {
  const [period, setPeriod] = useState<DashboardChartPeriod>('month')
  const [chartData, setChartData] = useState<{ date: string; Замовлення: number; Виручка: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDashboardChart(period)
      .then(r => setChartData(r.points.map(p => ({ date: p.date, Замовлення: p.orders, Виручка: p.revenue }))))
      .finally(() => setLoading(false))
  }, [period])

  const chartStyle = { background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }

  return (
    <div style={{ background: '#f3f4f6', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PeriodSwitcher value={period} onChange={p => setPeriod(p as DashboardChartPeriod)} options={CHART_PERIOD_OPTIONS} />
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spin /></div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ ...chartStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>ЗАМОВЛЕННЯ</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, 'Замовлення']} labelFormatter={() => ''} />
                <Area type="monotone" dataKey="Замовлення" stroke="#6366f1" strokeWidth={2} fill="url(#ordersGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...chartStyle, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>ВИРУЧКА</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip formatter={(v) => [`₴${Number(v).toLocaleString('uk-UA')}`, 'Виручка']} labelFormatter={() => ''} />
                <Area type="monotone" dataKey="Виручка" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  Ribbon: 'Стрічки',
  Medal: 'Медалі',
  Certificate: 'Грамоти',
  Accessory: 'Аксесуари',
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

  const { orders, deliveries, designs, topProducts, recentOrders } = data

  const emblemLabel = (key: string) => EMBLEMS.find(e => e.key === Number(key))?.label ?? `Емблема ${key}`
  const colorLabel = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.label ?? key
  const colorHex = (key: string) => RIBBON_COLORS.find(c => c.value === key)?.hex ?? '#8c8c8c'
  const fontLabel = (key: string) => FONTS.find(f => f.value === key)?.label ?? key

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Дашборд</h2>
        <p style={{ color: '#8c8c8c', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Загальна статистика платформи</p>
      </div>

      {/* Block 1 — Stats with period switcher */}
      <StatsBlock />

      {/* Block 2 — Statuses + Recent Orders */}
      <Row gutter={[16, 0]}>
        <Col xs={24} lg={12}>
          <div style={{ background: '#f3f4f6', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {orders.statusCounts.map(s => (
                <div
                  key={s.statusId}
                  style={{
                    flex: '1 1 calc(50% - 5px)',
                    background: '#fff',
                    borderRadius: 14,
                    padding: '14px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    borderTop: `3px solid ${s.statusColor}`,
                  }}
                >
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 6 }}>{s.statusName}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{s.count}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: orders.stuck > 0 ? '#fef2f2' : '#fff',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              borderTop: `3px solid ${orders.stuck > 0 ? '#ef4444' : '#e5e7eb'}`,
            }}>
              <div>
                <div style={{ fontSize: 11, color: orders.stuck > 0 ? '#ef4444' : '#9ca3af', fontWeight: 500, marginBottom: 4 }}>
                  <WarningOutlined style={{ marginRight: 5 }} />Застряглі {'>'} 3 днів
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Нові за тиждень: <strong>{orders.newThisWeek}</strong></div>
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: orders.stuck > 0 ? '#ef4444' : '#111827' }}>{orders.stuck}</div>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ background: '#f3f4f6', borderRadius: 16, padding: 14, height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Останні замовлення</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentOrders.map(o => (
                <div key={o.id} style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Link to={`/orders/${o.id}`} style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>#{o.orderNumber}</Link>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '1px 8px',
                          borderRadius: 20,
                          background: o.statusColor + '20',
                          color: o.statusColor,
                          fontWeight: 500,
                        }}
                      >{o.statusName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{o.clientName ?? 'Анонім'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>₴{o.total.toLocaleString('uk-UA')}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(o.createdAt).toLocaleDateString('uk-UA')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Block 3 — Distributions */}
      <DistributionsBlock />

      {/* Block 4 — Charts */}
      <ChartsBlock />

      {/* Block 6 — Deliveries */}
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

      {/* Block 7 — Designs */}
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

      {/* Block 8 — Top Products */}
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
