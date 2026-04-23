import { useEffect, useState } from 'react'
import { Input, Table } from 'antd'
import { HeartOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getSavedDesigns } from '../../api/designs'
import type { AdminSavedDesignItem } from '../../api/types'

export default function SavedDesignsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminSavedDesignItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const pageSize = 20

  useEffect(() => {
    setLoading(true)
    getSavedDesigns(page, pageSize)
      .then(res => { setItems(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [page])

  const filtered = search.trim()
    ? items.filter(d =>
        d.userFullName.toLowerCase().includes(search.toLowerCase()) ||
        d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        d.designName.toLowerCase().includes(search.toLowerCase())
      )
    : items

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Назва дизайну', dataIndex: 'designName', key: 'designName' },
    { title: 'Користувач', dataIndex: 'userFullName', key: 'userFullName' },
    { title: 'Email', dataIndex: 'userEmail', key: 'userEmail' },
    {
      title: 'Збережено',
      dataIndex: 'savedAt',
      key: 'savedAt',
      render: (v: string) => new Date(v).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
        }}>
          <HeartOutlined />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Збережені дизайни</h2>
          <p style={{ color: '#8c8c8c', fontSize: 13, margin: 0 }}>Всі збережені дизайни користувачів</p>
        </div>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="Пошук по імені, email або назві дизайну"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 16 }}
        allowClear
      />

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={loading}
        pagination={{ current: page, pageSize, total, onChange: setPage }}
        onRow={record => ({ onClick: () => navigate(`/designs/${record.id}`) })}
        rowClassName={() => 'clickable-row'}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}
