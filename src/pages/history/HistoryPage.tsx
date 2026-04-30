import { useEffect, useState } from 'react'
import { Table, Select, DatePicker, Tag, Tooltip, Space, Typography, Collapse } from 'antd'
import { HistoryOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getAuditLogs,
  type AuditLogResponse,
  type AuditLogFilters,
  AUDIT_ENTITY_TYPES,
  AUDIT_ACTIONS,
  AUDIT_FIELD_NAMES,
} from '../../api/auditLogs'
import { getAdmins } from '../../api/admins'
import type { AdminAdminItem } from '../../api/types'

const { RangePicker } = DatePicker
const { Text } = Typography

const ACTION_COLORS: Record<string, string> = {
  Create: 'green',
  Update: 'blue',
  Delete: 'red',
}

const ENTITY_ROUTE: Record<string, (id: number) => string> = {
  Order: (id) => `/orders/${id}`,
  Product: (id) => `/products/${id}`,
  User: (id) => `/users/${id}`,
  Admin: (id) => `/admins/${id}`,
  Delivery: (id) => `/deliveries/${id}`,
}

interface FieldChange {
  field: string
  old: string | null
  new: string | null
}

function parseChanges(changesJson: string | null): FieldChange[] | Record<string, string> | null {
  if (!changesJson) return null
  try {
    return JSON.parse(changesJson)
  } catch {
    return null
  }
}

function ChangesCell({ log }: { log: AuditLogResponse }) {
  const parsed = parseChanges(log.changesJson)
  if (!parsed) return <Text type="secondary">—</Text>

  if (log.action === 'Create') {
    const snapshot = parsed as Record<string, string>
    return (
      <Collapse
        ghost
        size="small"
        items={[{
          key: '1',
          label: <Text type="secondary" style={{ fontSize: 12 }}>Переглянути поля ({Object.keys(snapshot).length})</Text>,
          children: (
            <div style={{ fontSize: 12 }}>
              {Object.entries(snapshot).map(([k, v]) => (
                <div key={k}>
                  <Text type="secondary">{AUDIT_FIELD_NAMES[k] ?? k}:</Text>{' '}
                  <Text>{String(v)}</Text>
                </div>
              ))}
            </div>
          ),
        }]}
      />
    )
  }

  const changes = parsed as FieldChange[]
  return (
    <div style={{ fontSize: 12 }}>
      {changes.map((c, i) => (
        <div key={i} style={{ marginBottom: 2 }}>
          <Text strong style={{ fontSize: 12 }}>{AUDIT_FIELD_NAMES[c.field] ?? c.field}: </Text>
          <Text delete type="secondary" style={{ fontSize: 12 }}>{c.old ?? '—'}</Text>
          {' → '}
          <Text style={{ fontSize: 12 }}>{c.new ?? '—'}</Text>
        </div>
      ))}
    </div>
  )
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, pageSize: 50 })
  const [admins, setAdmins] = useState<AdminAdminItem[]>([])

  useEffect(() => {
    getAdmins(1, 200).then(res => setAdmins(res.items)).catch(() => {})
  }, [])

  async function load(f: AuditLogFilters) {
    setLoading(true)
    try {
      const res = await getAuditLogs(f)
      setLogs(res.items)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(filters) }, [])

  function applyFilter(partial: Partial<AuditLogFilters>) {
    const next = { ...filters, ...partial, page: 1 }
    setFilters(next)
    load(next)
  }

  const columns = [
    {
      title: 'Коли',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (v: string) => (
        <Tooltip title={dayjs(v).format('DD.MM.YYYY HH:mm:ss')}>
          <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{dayjs(v).format('DD.MM HH:mm')}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Адмін',
      dataIndex: 'adminName',
      key: 'adminName',
      width: 150,
      render: (name: string, row: AuditLogResponse) => (
        <span style={{ fontSize: 13 }}>
          {name}
          {row.adminId === 0 && <Tag color="gold" style={{ marginLeft: 4, fontSize: 10 }}>Super</Tag>}
        </span>
      ),
    },
    {
      title: 'Дія',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (action: string) => (
        <Tag color={ACTION_COLORS[action] ?? 'default'}>{AUDIT_ACTIONS[action] ?? action}</Tag>
      ),
    },
    {
      title: 'Сутність',
      key: 'entity',
      width: 180,
      render: (_: unknown, row: AuditLogResponse) => {
        const label = AUDIT_ENTITY_TYPES[row.entityType] ?? row.entityType
        const route = ENTITY_ROUTE[row.entityType]?.(row.entityId)
        return (
          <Space size={4}>
            <Text style={{ fontSize: 13 }}>{label}</Text>
            {route ? (
              <a href={route} style={{ fontSize: 12 }}>#{row.entityId}</a>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>#{row.entityId}</Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Зміни',
      key: 'changes',
      render: (_: unknown, row: AuditLogResponse) => <ChangesCell log={row} />,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <HistoryOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Історія змін</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Журнал дій адміністраторів</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          allowClear
          placeholder="Тип сутності"
          style={{ width: 160 }}
          options={Object.entries(AUDIT_ENTITY_TYPES).map(([v, l]) => ({ value: v, label: l }))}
          onChange={(v) => applyFilter({ entityType: v })}
        />
        <Select
          allowClear
          placeholder="Адмін"
          style={{ width: 180 }}
          options={[
            { value: 0, label: 'Super Admin' },
            ...admins.map(a => ({ value: a.id, label: a.fullName })),
          ]}
          onChange={(v) => applyFilter({ adminId: v })}
        />
        <Select
          allowClear
          placeholder="Дія"
          style={{ width: 140 }}
          options={Object.entries(AUDIT_ACTIONS).map(([v, l]) => ({ value: v, label: l }))}
          onChange={(v) => applyFilter({ action: v })}
        />
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="DD.MM.YYYY HH:mm"
          onChange={(dates) => applyFilter({
            from: dates?.[0]?.toISOString(),
            to: dates?.[1]?.toISOString(),
          })}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={logs}
        columns={columns}
        loading={loading}
        size="small"
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          showTotal: (t) => `Всього ${t} записів`,
          onChange: (page, pageSize) => {
            const next = { ...filters, page, pageSize }
            setFilters(next)
            load(next)
          },
        }}
      />
    </div>
  )
}
