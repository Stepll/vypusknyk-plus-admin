import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Table, Button, Tag, Select, Input, Badge, Progress } from 'antd'
import { PlusOutlined, SearchOutlined, TruckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { deliveryStore } from '../../stores/DeliveryStore'
import type { DeliverySummary, DeliveryStatus } from '../../api/types'

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> = {
  pending:  { label: 'Очікується', color: 'default' },
  partial:  { label: 'Частково',   color: 'gold' },
  received: { label: 'Прийнято',   color: 'green' },
}

const DeliveriesPage = observer(() => {
  const store = deliveryStore
  const navigate = useNavigate()

  useEffect(() => {
    store.fetchSuppliers()
    store.fetchDeliveries()
  }, [])

  const columns = [
    {
      title: 'Номер', dataIndex: 'number', key: 'number', width: 160,
      render: (v: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{v}</span>,
    },
    {
      title: 'Постачальник', dataIndex: 'supplierName', key: 'supplierName',
      render: (v: string | null) => v
        ? <span style={{ fontWeight: 500 }}>{v}</span>
        : <span style={{ color: '#D1D5DB' }}>—</span>,
    },
    {
      title: 'Очікувана дата', dataIndex: 'expectedDate', key: 'expectedDate', width: 150,
      render: (v: string) => <span style={{ color: '#6B7280', fontSize: 13 }}>{v}</span>,
    },
    {
      title: 'Позицій', dataIndex: 'itemCount', key: 'itemCount', width: 90, align: 'center' as const,
      render: (v: number) => <span style={{ color: '#6B7280' }}>{v}</span>,
    },
    {
      title: 'Прийнято / Очікувано', key: 'progress', width: 200,
      render: (_: unknown, r: DeliverySummary) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: '#6B7280' }}>{r.totalReceivedQty} / {r.totalExpectedQty} шт</span>
          </div>
          <Progress
            percent={r.totalExpectedQty > 0 ? Math.round(r.totalReceivedQty / r.totalExpectedQty * 100) : 0}
            size="small" showInfo={false}
            strokeColor={r.status === 'received' ? '#16A34A' : r.status === 'partial' ? '#D97706' : '#D1D5DB'}
          />
        </div>
      ),
    },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 130,
      render: (s: DeliveryStatus) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, color: 'default' }
        return <Tag color={cfg.color}>{cfg.label}</Tag>
      },
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
          }}>
            <TruckOutlined />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Поставки</h2>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Облік поставок товарів від постачальників</p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/deliveries/new')}
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', border: 'none' }}>
          Нова поставка
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          value={store.supplierFilter || undefined} placeholder="Постачальник" allowClear style={{ width: 200 }}
          onChange={v => store.setSupplierFilter(v ?? '')}
          options={store.suppliers.map(s => ({ value: String(s.id), label: s.name }))}
        />
        <Select
          value={store.statusFilter || undefined} placeholder="Статус" allowClear style={{ width: 150 }}
          onChange={v => store.setStatusFilter(v ?? '')}
          options={[
            { value: 'pending',  label: 'Очікується' },
            { value: 'partial',  label: 'Частково' },
            { value: 'received', label: 'Прийнято' },
          ]}
        />
        <Input
          prefix={<SearchOutlined />} placeholder="Пошук за номером або постачальником..."
          value={store.search} onChange={e => store.setSearch(e.target.value)}
          style={{ width: 280 }} allowClear
        />
        <Badge count={store.total} showZero overflowCount={9999} color="#6B7280">
          <span style={{ color: '#6B7280', fontSize: 13, padding: '4px 8px' }}>поставок</span>
        </Badge>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        dataSource={store.deliveries}
        columns={columns}
        loading={store.loading}
        pagination={{
          current: store.page,
          pageSize: store.pageSize,
          total: store.total,
          onChange: p => store.setPage(p),
          showSizeChanger: false,
        }}
        onRow={r => ({ onClick: () => navigate(`/deliveries/${r.id}`), style: { cursor: 'pointer' } })}
      />
    </div>
  )
})

export default DeliveriesPage
