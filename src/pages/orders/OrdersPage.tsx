import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Tag, Select } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { ordersStore } from '../../stores/OrdersStore'
import type { AdminOrder } from '../../api/types'

const STATUS_COLORS: Record<string, string> = {
  Accepted: 'orange',
  Production: 'blue',
  Shipped: 'cyan',
  Delivered: 'green',
}

const STATUS_LABELS: Record<string, string> = {
  Accepted: 'Прийнято',
  Production: 'У виробництві',
  Shipped: 'Відправлено',
  Delivered: 'Доставлено',
}

const STATUS_OPTIONS = [
  { value: '', label: 'Всі статуси' },
  { value: 'Accepted', label: 'Прийнято' },
  { value: 'Production', label: 'У виробництві' },
  { value: 'Shipped', label: 'Відправлено' },
  { value: 'Delivered', label: 'Доставлено' },
]

const columns = [
  { title: '№', dataIndex: 'orderNumber', key: 'orderNumber', width: 80 },
  {
    title: 'Клієнт',
    key: 'client',
    render: (_: unknown, r: AdminOrder) =>
      r.isAnonymous ? r.email ?? 'Гість' : r.recipient.fullName,
  },
  {
    title: 'Сума',
    dataIndex: 'total',
    key: 'total',
    render: (v: number) => <strong>{v} грн</strong>,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: string) => (
      <Tag color={STATUS_COLORS[s] ?? 'default'}>{STATUS_LABELS[s] ?? s}</Tag>
    ),
  },
  {
    title: 'Змінити статус',
    key: 'actions',
    render: (_: unknown, r: AdminOrder) => (
      <Select
        size="small"
        value={r.status}
        style={{ width: 160 }}
        options={STATUS_OPTIONS.filter(o => o.value)}
        onChange={val => ordersStore.updateStatus(r.id, val)}
      />
    ),
  },
  {
    title: 'Дата',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (v: string) => new Date(v).toLocaleDateString('uk-UA'),
  },
]

const OrdersPage = observer(() => {
  useEffect(() => { ordersStore.fetchOrders() }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <ShoppingCartOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Замовлення</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Управління замовленнями клієнтів</p>
          </div>
        </div>
        <Select
          value={ordersStore.statusFilter}
          options={STATUS_OPTIONS}
          style={{ width: 180 }}
          onChange={val => ordersStore.setStatusFilter(val)}
          placeholder="Фільтр за статусом"
        />
      </div>
      <Table
        rowKey="id"
        dataSource={ordersStore.orders}
        columns={columns}
        loading={ordersStore.loading}
        pagination={{
          current: ordersStore.page,
          pageSize: ordersStore.pageSize,
          total: ordersStore.total,
          onChange: p => ordersStore.setPage(p),
        }}
      />
    </div>
  )
})

export default OrdersPage
