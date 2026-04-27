import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button, Card, Col, Row, Select, Tag, Spin, message, Descriptions,
} from 'antd'
import {
  ArrowLeftOutlined, ShoppingOutlined, DownOutlined, RightOutlined,
} from '@ant-design/icons'
import { getOrder, updateOrderStatus } from '../../api/orders'
import { getOrderStatuses } from '../../api/orderStatuses'
import type { AdminOrder, AdminOrderItem, NamesData, RibbonCustomization, OrderStatusResponse } from '../../api/types'

const DELIVERY_LABELS: Record<string, string> = {
  'nova-poshta': 'Нова Пошта',
  'ukrposhta':   'Укрпошта',
  'pickup':      'Самовивіз',
}

const PAYMENT_LABELS: Record<string, string> = {
  Cod:    'Накладний платіж',
  Online: 'Онлайн',
}

const PRINT_LABELS: Record<string, string> = {
  gold:   'Золото', silver: 'Срібло', black: 'Чорний', color: 'Кольоровий',
}
const MATERIAL_LABELS: Record<string, string> = {
  satin: 'Атлас', velvet: 'Оксамит', rep: 'Реп',
}
const COLOR_LABELS: Record<string, string> = {
  coral: 'Корал', 'blue-yellow': 'Синьо-жовтий', white: 'Білий',
  gold: 'Золотий', red: 'Червоний', green: 'Зелений', purple: 'Фіолетовий', black: 'Чорний',
}

function RibbonDetails({ rc }: { rc: RibbonCustomization }) {
  const rows = [
    rc.designName   && ['Дизайн',           rc.designName],
    rc.mainText     && ['Основний текст',    rc.mainText],
    rc.school       && ['Школа',             rc.school],
    rc.color        && ['Колір',             COLOR_LABELS[rc.color] ?? rc.color],
    rc.material     && ['Матеріал',          MATERIAL_LABELS[rc.material] ?? rc.material],
    rc.printType    && ['Тип друку',         PRINT_LABELS[rc.printType] ?? rc.printType],
    rc.textColor    && ['Колір тексту',      rc.textColor],
    rc.extraTextColor && ['Доп. колір',      rc.extraTextColor],
    rc.font         && ['Шрифт',             rc.font],
    rc.comment      && ['Коментар',          rc.comment],
  ].filter(Boolean) as [string, string][]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', padding: '10px 0 4px' }}>
      {rows.map(([label, value]) => (
        <>
          <span key={`l-${label}`} style={{ color: '#8c8c8c', fontSize: 13, whiteSpace: 'nowrap' }}>{label}:</span>
          <span key={`v-${label}`} style={{ fontSize: 13 }}>{value}</span>
        </>
      ))}
    </div>
  )
}

function NamesDetails({ nd }: { nd: NamesData }) {
  return (
    <div style={{ padding: '10px 0 4px' }}>
      {nd.school && (
        <div style={{ marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: '#8c8c8c' }}>Школа: </span>{nd.school}
        </div>
      )}
      {nd.groups.map((g, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{g.className}</div>
          <div style={{ fontSize: 12, color: '#595959', whiteSpace: 'pre-wrap', paddingLeft: 8 }}>
            {g.names}
          </div>
        </div>
      ))}
    </div>
  )
}

function OrderItemRow({ item }: { item: AdminOrderItem }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = !!(item.ribbonCustomization || item.namesData)
  const subtotal = item.quantity * item.price

  return (
    <div style={{ borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
        {hasDetails ? (
          <Button
            type="text"
            size="small"
            icon={expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
            onClick={() => setExpanded(v => !v)}
            style={{ width: 24, minWidth: 24, padding: 0, color: '#059669' }}
          />
        ) : (
          <div style={{ width: 24 }} />
        )}
        <div style={{ flex: 1, fontSize: 14 }}>
          {item.name}
          {item.ribbonCustomization && (
            <Tag color="green" style={{ marginLeft: 8, fontSize: 11 }}>Конструктор</Tag>
          )}
          {item.namesData && (
            <Tag color="blue" style={{ marginLeft: 4, fontSize: 11 }}>Імена</Tag>
          )}
        </div>
        <span style={{ color: '#8c8c8c', fontSize: 13, width: 60, textAlign: 'center' }}>
          × {item.quantity}
        </span>
        <span style={{ fontSize: 13, width: 80, textAlign: 'right', color: '#8c8c8c' }}>
          {item.price.toFixed(2)} ₴
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, width: 90, textAlign: 'right' }}>
          {subtotal.toFixed(2)} ₴
        </span>
      </div>

      {expanded && hasDetails && (
        <div style={{
          marginLeft: 32, marginBottom: 12, background: '#fafafa',
          borderRadius: 8, padding: '4px 12px',
        }}>
          {item.ribbonCustomization && <RibbonDetails rc={item.ribbonCustomization} />}
          {item.namesData && <NamesDetails nd={item.namesData} />}
        </div>
      )}
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [statuses, setStatuses] = useState<OrderStatusResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    Promise.all([
      getOrder(Number(id)),
      getOrderStatuses(),
    ])
      .then(([o, s]) => { setOrder(o); setStatuses(s) })
      .catch(() => { message.error('Не вдалося завантажити замовлення'); navigate('/orders') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const statusMap = Object.fromEntries(statuses.map(s => [s.name, s]))

  const handleStatusChange = async (status: string) => {
    if (!order) return
    setStatusUpdating(true)
    try {
      await updateOrderStatus(order.id, status)
      setOrder(o => o ? { ...o, status } : o)
      message.success('Статус оновлено')
    } catch {
      message.error('Помилка оновлення статусу')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  if (!order) return null

  const createdAt = new Date(order.createdAt).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/orders')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <ShoppingOutlined />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
                Замовлення #{order.orderNumber}
              </h2>
              {statusMap[order.status]
                ? <Tag style={{ color: '#fff', background: statusMap[order.status].color, border: 'none', margin: 0 }}>{order.status}</Tag>
                : <Tag style={{ margin: 0 }}>{order.status}</Tag>
              }
            </div>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>{createdAt}</p>
          </div>
        </div>
        <Select
          value={order.status}
          options={statuses.map(s => ({ value: s.name, label: s.name }))}
          onChange={handleStatusChange}
          loading={statusUpdating}
          style={{ width: 180 }}
          size="large"
        />
      </div>

      <Row gutter={24} align="top">
        {/* Left — items */}
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 12 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Позиції замовлення</span>}
          >
            {/* Table header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              paddingBottom: 8, borderBottom: '2px solid #f0f0f0',
              color: '#8c8c8c', fontSize: 12, fontWeight: 600,
            }}>
              <div style={{ width: 24 }} />
              <div style={{ flex: 1 }}>Назва</div>
              <div style={{ width: 60, textAlign: 'center' }}>К-сть</div>
              <div style={{ width: 80, textAlign: 'right' }}>Ціна</div>
              <div style={{ width: 90, textAlign: 'right' }}>Сума</div>
            </div>

            {order.items.map(item => (
              <OrderItemRow key={item.id} item={item} />
            ))}

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
              gap: 16, paddingTop: 12, marginTop: 4,
            }}>
              <span style={{ fontSize: 15, color: '#8c8c8c' }}>Разом:</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>
                {order.total.toFixed(2)} ₴
              </span>
            </div>
          </Card>
        </Col>

        {/* Right — info */}
        <Col xs={24} lg={8}>
          <Card
            style={{ borderRadius: 12, marginBottom: 16 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Покупець</span>}
          >
            <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c' } }}>
              <Descriptions.Item label="Імʼя">{order.recipient.fullName || '–'}</Descriptions.Item>
              <Descriptions.Item label="Телефон">{order.recipient.phone || '–'}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.email || '–'}</Descriptions.Item>
              {order.isAnonymous && (
                <Descriptions.Item label="Тип">
                  <Tag>Анонімне</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card
            style={{ borderRadius: 12, marginBottom: 16 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Доставка</span>}
          >
            <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c' } }}>
              <Descriptions.Item label="Спосіб">
                {DELIVERY_LABELS[order.delivery.method] ?? order.delivery.method}
              </Descriptions.Item>
              {order.delivery.city && (
                <Descriptions.Item label="Місто">{order.delivery.city}</Descriptions.Item>
              )}
              {order.delivery.warehouse && (
                <Descriptions.Item label="Відділення">{order.delivery.warehouse}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card
            style={{ borderRadius: 12 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>Оплата</span>}
          >
            <Descriptions column={1} size="small" styles={{ label: { color: '#8c8c8c' } }}>
              <Descriptions.Item label="Метод">
                {PAYMENT_LABELS[order.payment] ?? order.payment}
              </Descriptions.Item>
              {order.comment && (
                <Descriptions.Item label="Коментар">{order.comment}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
