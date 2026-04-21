import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Table, Button, Tag, Modal, Form, InputNumber, DatePicker, Input,
  Card, Row, Col, Statistic, Space, Spin, message, Drawer, Timeline,
} from 'antd'
import {
  ArrowLeftOutlined, CheckOutlined, CheckCircleOutlined,
  InboxOutlined, ClockCircleOutlined, TruckOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { deliveryStore } from '../../stores/DeliveryStore'
import type { DeliveryItemResponse, DeliveryStatus, ReceiveTransactionInfo } from '../../api/types'

const MATERIAL_LABELS: Record<string, string> = {
  Atlas: 'Атлас', Satin: 'Сатин', Silk: 'Шовк',
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> = {
  pending:  { label: 'Очікується', color: 'default' },
  partial:  { label: 'Частково',   color: 'gold' },
  received: { label: 'Прийнято',   color: 'green' },
}

const DeliveryDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const deliveryId = Number(id)

  const store = deliveryStore
  const detail = store.deliveryDetails.get(deliveryId)
  const isLoading = store.detailLoading.has(deliveryId)

  const [receiveItem, setReceiveItem] = useState<DeliveryItemResponse | null>(null)
  const [receiveAllOpen, setReceiveAllOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState<DeliveryItemResponse | null>(null)
  const [form] = Form.useForm()
  const [allForm] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    store.fetchDeliveryDetail(deliveryId)
  }, [deliveryId])

  const handleReceiveItem = async () => {
    if (!receiveItem) return
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      await store.receiveItem(
        deliveryId, receiveItem.id,
        values.quantity,
        (values.date as dayjs.Dayjs).format('YYYY-MM-DD'),
        values.note ?? '',
      )
      form.resetFields()
      setReceiveItem(null)
      message.success('Товар прийнято')
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReceiveAll = async () => {
    const values = await allForm.validateFields()
    setSubmitting(true)
    try {
      await store.receiveAll(deliveryId, (values.date as dayjs.Dayjs).format('YYYY-MM-DD'))
      allForm.resetFields()
      setReceiveAllOpen(false)
      message.success('Всі позиції прийнято')
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading && !detail) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
  }

  if (!detail) {
    return <div style={{ color: '#9CA3AF', padding: 40, textAlign: 'center' }}>Поставку не знайдено</div>
  }

  const statusCfg = STATUS_CONFIG[detail.status] ?? { label: detail.status, color: 'default' }
  const pendingItems = detail.items.filter(i => i.receivedQty < i.expectedQty)

  const columns = [
    {
      title: 'Товар', key: 'product',
      render: (_: unknown, r: DeliveryItemResponse) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.productName}</div>
          <div style={{ color: '#9CA3AF', fontSize: 12 }}>{r.categoryName} / {r.subcategoryName}</div>
        </div>
      ),
    },
    {
      title: 'Матеріал', key: 'material', width: 90,
      render: (_: unknown, r: DeliveryItemResponse) =>
        r.hasMaterial
          ? <span style={{ color: '#6B7280', fontSize: 13 }}>{MATERIAL_LABELS[r.material] ?? r.material}</span>
          : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Колір', key: 'color', width: 100,
      render: (_: unknown, r: DeliveryItemResponse) =>
        r.hasColor
          ? <span style={{ color: '#6B7280', fontSize: 13 }}>{r.color}</span>
          : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Очікувано', dataIndex: 'expectedQty', key: 'expectedQty', width: 100, align: 'center' as const,
      render: (v: number) => <strong>{v} шт</strong>,
    },
    {
      title: 'Прийнято', key: 'received', width: 110, align: 'center' as const,
      render: (_: unknown, r: DeliveryItemResponse) => (
        <span style={{ fontWeight: 600, color: r.receivedQty >= r.expectedQty ? '#16A34A' : r.receivedQty > 0 ? '#D97706' : '#9CA3AF' }}>
          {r.receivedQty} шт
        </span>
      ),
    },
    {
      title: 'Дата прийому', dataIndex: 'receivedAt', key: 'receivedAt', width: 130,
      render: (v: string | null) => v
        ? <span style={{ color: '#6B7280', fontSize: 13 }}>{v}</span>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Статус', key: 'itemStatus', width: 120,
      render: (_: unknown, r: DeliveryItemResponse) => {
        if (r.receivedQty >= r.expectedQty) return <Tag color="green">Прийнято</Tag>
        if (r.receivedQty > 0) return <Tag color="gold">Частково</Tag>
        return <Tag color="default">Очікується</Tag>
      },
    },
    {
      title: 'Дії', key: 'actions', width: 140,
      render: (_: unknown, r: DeliveryItemResponse) => (
        <Space>
          <Button
            size="small"
            icon={<InfoCircleOutlined />}
            title="Історія прийому"
            onClick={() => setHistoryItem(r)}
          />
          {r.receivedQty < r.expectedQty ? (
            <Button size="small" type="primary" icon={<CheckOutlined />}
              onClick={() => {
                setReceiveItem(r)
                form.setFieldsValue({ quantity: r.expectedQty - r.receivedQty, date: dayjs() })
              }}>
              Прийняти
            </Button>
          ) : (
            <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 18 }} />
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/deliveries')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
            }}>
              <TruckOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{detail.number}</h2>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </div>
              <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>
                {detail.supplierName ?? 'Без постачальника'} · {detail.expectedDate}
                {detail.note && <span> · {detail.note}</span>}
              </p>
            </div>
          </div>
        </div>
        {pendingItems.length > 0 && (
          <Button type="primary" icon={<CheckCircleOutlined />}
            onClick={() => { setReceiveAllOpen(true); allForm.setFieldsValue({ date: dayjs() }) }}
            style={{ background: '#16A34A', borderColor: '#16A34A' }}>
            Прийняти всі ({pendingItems.length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Позицій', value: detail.items.length, icon: <InboxOutlined />, color: '#4F46E5' },
          { title: 'Очікувано', value: detail.items.reduce((s, i) => s + i.expectedQty, 0), suffix: 'шт', icon: <ClockCircleOutlined />, color: '#D97706' },
          { title: 'Прийнято', value: detail.items.reduce((s, i) => s + i.receivedQty, 0), suffix: 'шт', icon: <CheckCircleOutlined />, color: '#16A34A' },
        ].map(s => (
          <Col span={8} key={s.title}>
            <Card>
              <Statistic title={s.title} value={s.value} suffix={s.suffix ?? ''}
                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                valueStyle={{ color: s.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Items table */}
      <Table rowKey="id" dataSource={detail.items} columns={columns} pagination={false} />

      {/* Receive item modal */}
      <Modal
        open={!!receiveItem}
        onCancel={() => { setReceiveItem(null); form.resetFields() }}
        title={`Прийняти: ${receiveItem?.productName}`}
        footer={
          <Space>
            <Button onClick={() => { setReceiveItem(null); form.resetFields() }}>Скасувати</Button>
            <Button type="primary" loading={submitting} onClick={handleReceiveItem}>Прийняти</Button>
          </Space>
        }
      >
        {receiveItem && (
          <div style={{ marginBottom: 12, color: '#6B7280', fontSize: 13 }}>
            {receiveItem.hasMaterial && <span>Матеріал: <strong>{MATERIAL_LABELS[receiveItem.material] ?? receiveItem.material}</strong> · </span>}
            {receiveItem.hasColor && <span>Колір: <strong>{receiveItem.color}</strong> · </span>}
            Залишилось прийняти: <strong>{receiveItem.expectedQty - receiveItem.receivedQty} шт</strong>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item name="quantity" label="Фактична кількість"
            rules={[{ required: true }, { type: 'number', min: 1, max: receiveItem ? receiveItem.expectedQty - receiveItem.receivedQty : undefined }]}>
            <InputNumber min={1} max={receiveItem ? receiveItem.expectedQty - receiveItem.receivedQty : undefined}
              style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="note" label="Примітка">
            <Input placeholder="Необов'язково..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Receive all modal */}
      <Modal
        open={receiveAllOpen}
        onCancel={() => { setReceiveAllOpen(false); allForm.resetFields() }}
        title="Прийняти всі позиції"
        footer={
          <Space>
            <Button onClick={() => { setReceiveAllOpen(false); allForm.resetFields() }}>Скасувати</Button>
            <Button type="primary" loading={submitting} onClick={handleReceiveAll}
              style={{ background: '#16A34A', borderColor: '#16A34A' }}>
              Прийняти всі
            </Button>
          </Space>
        }
      >
        <p style={{ color: '#6B7280' }}>
          Буде зареєстровано прихід для <strong>{pendingItems.length}</strong> позицій
          загальною кількістю <strong>{pendingItems.reduce((s, i) => s + (i.expectedQty - i.receivedQty), 0)} шт</strong>.
        </p>
        <Form form={allForm} layout="vertical">
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Receive history drawer */}
      <Drawer
        open={!!historyItem}
        onClose={() => setHistoryItem(null)}
        width={420}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <InfoCircleOutlined />
            <span>Історія прийому</span>
          </div>
        }
      >
        {historyItem && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{historyItem.productName}</div>
              <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                {historyItem.categoryName} / {historyItem.subcategoryName}
                {historyItem.hasMaterial && <span> · {MATERIAL_LABELS[historyItem.material] ?? historyItem.material}</span>}
                {historyItem.hasColor && <span> · {historyItem.color}</span>}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13 }}>
                <span>Очікувано: <strong>{historyItem.expectedQty} шт</strong></span>
                <span>Прийнято: <strong style={{ color: historyItem.receivedQty >= historyItem.expectedQty ? '#16A34A' : '#D97706' }}>{historyItem.receivedQty} шт</strong></span>
              </div>
            </div>

            {historyItem.receiveHistory.length === 0 ? (
              <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>
                Прийомів ще не було
              </div>
            ) : (
              <Timeline
                items={historyItem.receiveHistory.map((t: ReceiveTransactionInfo) => ({
                  color: 'green',
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>+{t.quantity} шт</span>
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>{t.date}</span>
                      </div>
                      {t.note && (
                        <div style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{t.note}</div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
})

export default DeliveryDetailPage
