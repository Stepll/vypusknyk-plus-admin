import { useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getSavedDesigns } from '../../api/designs'
import type { AdminSavedDesignItem } from '../../api/types'

export default function SavedDesignsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AdminSavedDesignItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 20

  useEffect(() => {
    setLoading(true)
    getSavedDesigns(page, pageSize)
      .then(res => { setItems(res.items); setTotal(res.total) })
      .finally(() => setLoading(false))
  }, [page])

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Назва дизайну', dataIndex: 'designName', key: 'designName' },
    {
      title: 'Користувач',
      key: 'user',
      render: (_: unknown, row: AdminSavedDesignItem) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/users/${row.userId}`)}>
          {row.userFullName}
        </Button>
      ),
    },
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
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={{ current: page, pageSize, total, onChange: setPage }}
      />
    </div>
  )
}
