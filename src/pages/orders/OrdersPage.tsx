import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Tag, Select, Space } from 'antd'
import { ordersStore } from '../../stores/OrdersStore'
import type { AdminOrder } from '../../api/types'

const STATUS_COLORS: Record<string, string> = {
  Accepted: 'orange',
  Production: 'blue',
  Shipped: 'cyan',
  Delivered: 'green',
}

const STATUS_OPTIONS = [
  { value: '', label: 'Всі статуси' },
  { value: 'Accepted', label: 'Прийнято' },
  { value: 'Production', label: 'У виробництві' },
  { value: 'Shipped', label: 'Відправлено' },
  { value: 'Delivered', label: 'Доставлено' },
]

const columns = [
  { title: '№', dataIndex: 'orderNumber', key: 'orderNumber' },
  {
    title: 'Клієнт',
    key: 'client',
    render: (_: unknown, r: AdminOrder) =>
      r.isAnonymous ? r.email ?? 'Гість' : r.recipient.fullName,
  },
  { title: 'Сума', dataIndex: 'total', key: 'total', render: (v: number) => `${v} грн` },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: string) => <Tag color={STATUS_COLORS[s] ?? 'default'}>{s}</Tag>,
  },
  {
    title: 'Змінити статус',
    key: 'actions',
    render: (_: unknown, r: AdminOrder) => (
      <Select
        size="small"
        value={r.status}
        style={{ width: 140 }}
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
      <Space className="mb-4">
        <h2 className="text-xl font-semibold">Замовлення</h2>
        <Select
          value={ordersStore.statusFilter}
          options={STATUS_OPTIONS}
          style={{ width: 160 }}
          onChange={val => ordersStore.setStatusFilter(val)}
        />
      </Space>
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
